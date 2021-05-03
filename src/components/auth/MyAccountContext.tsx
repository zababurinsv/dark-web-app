import React, { useReducer, createContext, useContext, useEffect } from 'react';
import store from 'store';
import { newLogger, nonEmptyStr } from '@darkpay/dark-utils';
import { AccountId } from '@polkadot/types/interfaces';
import { equalAddresses } from '../substrate';
import { ProfileData, SocialAccountWithId } from '@darkpay/dark-types';
import useDarkdotEffect from '../api/useDarkdotEffect';
import { SocialAccount } from '@darkpay/dark-types/substrate/interfaces';
import { GenericAccountId, Option } from '@polkadot/types'
import { resolveCidOfContent } from '@darkpay/dark-api/utils';
import registry from '@darkpay/dark-types/substrate/registry';

const log = newLogger('MyAccountContext')

function print (x?: any): string {
  return typeof x?.toString === 'function' ? x.toString() : ''
}

const MY_ADDRESS = 'df.myAddress'
const DID_SIGN_IN = 'df.didSignIn'

function storeDidSignIn () {
  store.set(DID_SIGN_IN, true)
}

export function readMyAddress (): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS)
  if (nonEmptyStr(myAddress)) {
    storeDidSignIn()
  }
  log.info(`Read my address from the local storage: ${print(myAddress)}`)
  return myAddress
}

export function storeMyAddress (myAddress: string) {
  store.set(MY_ADDRESS, myAddress)
  storeDidSignIn()
}

export const didSignIn = (): boolean => store.get(DID_SIGN_IN)

type MyAccountState = {
  inited: boolean,
  address?: string,
  account?: ProfileData
};

type MyAccountAction = {
  type: 'reload' | 'setAddress' | 'forget' | 'forgetExact' | 'setAccount',
  address?: string,
  account?: ProfileData
};

function reducer (state: MyAccountState, action: MyAccountAction): MyAccountState {
  function forget () {
    log.info('Forget my address and injected accounts');
    store.remove(MY_ADDRESS);
    return { ...state, address: undefined };
  }

  let address: string | undefined;

  switch (action.type) {
    case 'reload':
      address = readMyAddress();
      log.info(`Reload my address: ${print(address)}`);
      return { ...state, address, inited: true };

    case 'setAddress':
      address = action.address;
      if (!equalAddresses(address, state.address)) {
        if (address) {
          log.info(`Set my new address: ${print(address)}`);
          storeMyAddress(address)
          return { ...state, address, inited: true };
        } else {
          return forget();
        }
      }
      return state;

    case 'setAccount': {
      const account = action.account
      return { ...state, account }
    }

    case 'forget':
      return forget();

    default:
      throw new Error('No action type provided');
  }
}

function functionStub () {
  log.error(`Function needs to be set in ${MyAccountProvider.name}`);
}

const initialState = {
  inited: false,
  address: undefined
};

export type MyAccountContextProps = {
  state: MyAccountState,
  dispatch: React.Dispatch<MyAccountAction>,
  setAddress: (address: string) => void,
  signOut: () => void
};

const contextStub: MyAccountContextProps = {
  state: initialState,
  dispatch: functionStub,
  setAddress: functionStub,
  signOut: functionStub
};

export const MyAccountContext = createContext<MyAccountContextProps>(contextStub);

export function MyAccountProvider (props: React.PropsWithChildren<{}>) {
  const [ state, dispatch ] = useReducer(reducer, initialState);

  const { inited, address } = state

  useEffect(() => {
    if (!inited) {
      dispatch({ type: 'reload' })
    }
  }, [ inited ]) // Don't call this effect if `invited` is not changed

  useDarkdotEffect(({ substrate: { api }, darkdot: { ipfs } }) => {
    if (!inited || !address) return

    let unsub: { (): void | undefined; (): void; };

    const sub = async () => {
      const readyApi = await api

      unsub = await readyApi.query.profiles.socialAccountById(address, async (optSocialAccount: Option<SocialAccount>) => {
        let account: ProfileData | undefined
        const initStruct = optSocialAccount.unwrapOr(undefined)

        if (initStruct) {
          const id = new GenericAccountId(registry, address) as AccountId
          const profile = initStruct.profile.unwrapOr(undefined)
          const cid = profile && resolveCidOfContent(profile.content)
          const content = cid ? await ipfs.findProfile(cid) : undefined
          const struct = { ...initStruct, id } as SocialAccountWithId
          account = { struct, profile, content }
        }

        dispatch({ type: 'setAccount', account })
      })
    }

    sub()

    return () => { unsub && unsub() }

  }, [ inited, address || '' ])

  const contextValue = {
    state,
    dispatch,
    setAddress: (address: string) => dispatch({ type: 'setAddress', address }),
    signOut: () => dispatch({ type: 'forget' })
  };
  return (
    <MyAccountContext.Provider value={contextValue}>
      {props.children}
    </MyAccountContext.Provider>
  );
}

export function useMyAccount () {
  return useContext(MyAccountContext)
}

export function useMyAddress () {
  return useMyAccount().state.address
}

export function isMyAddress (anotherAddress?: string | AccountId) {
  return equalAddresses(useMyAddress(), anotherAddress)
}

export function useIsSignedIn () {
  return nonEmptyStr(useMyAddress())
}

export default MyAccountProvider
