import BN from 'bn.js'
import { Text, GenericAccountId, Option } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'
import { AddressProps } from 'src/components/profiles/address-views/utils/types'
import { toShortAddress, resolveBn } from 'src/components/utils'
import { Codec } from '@polkadot/types/types'
import { SubstrateId, AnyAccountId } from '@darkpay/dark-types'
import { SubmittableResult } from '@polkadot/api'
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';
import { DarkdotApi } from '@darkpay/dark-api/api/darkdot';
import { asAccountId } from '@darkpay/dark-api/utils'
import { AbstractInt } from '@polkadot/types/codec/AbstractInt'
export * from './getTxParams'
export * from './queryToProps'
export { isEqual } from './isEqual';
export { triggerChange } from './triggerChange';

function toString<DFT> (value?: { toString: () => string }, _default?: DFT): string | DFT | undefined {
  return value && typeof value.toString === 'function'
    ? value.toString()
    : _default
}

export type AnyText = string | Text | Option<Text>

export type AnyNumber = number | BN | AbstractInt | Option<AbstractInt>

export type AnyAddress = string | AccountId | GenericAccountId | Option<AccountId> | Option<GenericAccountId>

export function stringifyAny<DFT> (value?: any, _default?: DFT): string | DFT | undefined {
  if (typeof value !== 'undefined') {
    if (value instanceof Option) {
      return stringifyText(value.unwrapOr(undefined))
    } else {
      return toString(value)
    }
  }
  return _default
}

export function stringifyText<DFT> (value?: AnyText, _default?: DFT): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function stringifyNumber<DFT> (value?: AnyNumber, _default?: DFT): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function stringifyAddress<DFT> (value?: AnyAddress, _default?: DFT): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export const getStorefrontId = async (idOrHandle: string, darkdot?: DarkdotApi): Promise<BN | undefined> => {
  if (idOrHandle.startsWith('@')) {
    // Drop '@' char and lowercase handle before searching for its storefront.
    const handle = idOrHandle.substring(1).toLowerCase()
    const { substrate } = darkdot || await getDarkdotApi()
    return substrate.getStorefrontIdByHandle(handle)
  } else {
    return resolveBn(idOrHandle)
  }
}

export const getOrderingId = async (idOrHandle: string, darkdot?: DarkdotApi): Promise<BN | undefined> => {
    return resolveBn(idOrHandle)
}

export const getAvgPricesOffchain = async ( darkdot?: DarkdotApi): Promise<any[]> => {
  //const darkdot = await getDarkdotApi();
  const { substrate } = darkdot || await getDarkdotApi()
  return substrate.getPrices()
};

export function getNewIdFromEvent (txResult: SubmittableResult): BN | undefined {
  let id: BN | undefined;

  txResult.events.find(event => {
    const {
      event: { data, method }
    } = event;
    if (method.indexOf(`Created`) >= 0) {
      const [ /* owner */, newId ] = data.toArray();
      id = newId as unknown as BN;
      return true;
    }
    return false;
  });

  return id;
}

export const getAccountId = async (addressOrHandle: string): Promise<AnyAccountId | undefined> => {
  if (addressOrHandle.startsWith('@')) {
    const handle = addressOrHandle.substring(1) // Drop '@' char.
    const { substrate } = await getDarkdotApi()
    return substrate.getAccountIdByHandle(handle)
  } else {
    return addressOrHandle
  }
}

type MaybeAccAddr = undefined | string | GenericAccountId

export function equalAddresses (addr1: MaybeAccAddr, addr2: MaybeAccAddr): boolean {
  if (addr1 === addr2) {
    return true
  } else if (!addr1 || !addr2) {
    return false
  } else {
    return asAccountId(addr1)?.eq(asAccountId(addr2)) || false
  }
}

type GetNameOptions = AddressProps & {
  isShort?: boolean
}

export const getProfileName = (options: GetNameOptions) => {
  const { owner, isShort = true, address } = options
  return (
    owner?.content?.name ||
    (isShort ? toShortAddress(address) : address)
  ).toString()
}

export const unwrapSubstrateId = (optId?: Option<Codec>): SubstrateId | undefined => {
  if (optId instanceof Option) {
    return optId.unwrapOr(undefined) as any
  }

  return optId && optId as SubstrateId
}

export * from './getTxParams'
