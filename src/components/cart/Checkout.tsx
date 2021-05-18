
import { useCart } from "react-use-cart";
import { resolveIpfsUrl } from "src/ipfs";
import { PageContent } from "../main/PageWrapper";
import Section from "../utils/Section";
import React, { useState } from 'react'
import { Form, Input, Select, Table, Tag, Space } from 'antd'
import BN from 'bn.js'
import { getNewIdFromEvent, equalAddresses, stringifyText, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { OrderingUpdate, OrderingStates, OrderingState, OptionBool, OptionIpfsContent, OptionOptionText, OptionText, OptionId, IpfsContent } from '@darkpay/dark-types/substrate/classes'
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces'
import { OrderingContent } from '@darkpay/dark-types'
import { isEmptyStr } from '@darkpay/dark-utils'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import NoData from '../utils/EmptyList'
import DfMdEditor from '../utils/DfMdEditor'
//import { withLoadOrderingFromUrl, CheckOrderingPermissionFn, CanHaveOrderingProps } from './withLoadOrderingFromUrl'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN, MIN_HANDLE_LEN, MAX_HANDLE_LEN } from 'src/config/ValidationsConfig'
//import { NewSocialLinks } from './SocialLinks/NewSocialLinks'
import { UploadAvatar } from '../uploader'
import { MailOutlined } from '@ant-design/icons'
import { DarkdotSubstrateApi } from '@darkpay/dark-api/api/substrate'
import { resolveCidOfContent } from '@darkpay/dark-api/utils'
//import { getNonEmptyOrderingContent } from '../utils/content'
import messages from 'src/messages'
//import { clearAutoSavedContent } from '../utils/DfMdEditor/client'
//import { goToOrderingPage } from '../urls/goToPage'
//import { AutoSaveId } from '../utils/DfMdEditor/types'
//import { Countries } from '../utils/Countries'






type Content = OrderingContent

type FormValues = Partial<Content & {
  ordering_state: OrderingState
}>

type FieldName = keyof FormValues



const fieldName = (name: FieldName): FieldName => name

type ValidationProps = {
  minHandleLen: number
  maxHandleLen: number
  ordering? : any
}

// type FormProps = CanHaveOrderingProps & ValidationProps

type FormProps = ValidationProps

function getInitialValues ({ ordering }: FormProps): FormValues {
  if (ordering) {
    const { struct, content } = ordering
    const ordering_state = (struct.ordering_state)
    return { ...content, ordering_state }
  }
  return {}
}



type CheckoutProps = {

}

export const Checkout = ({ }: CheckoutProps) => {


    const {
        isEmpty,
        cartTotal,
        totalUniqueItems,
        items,
        updateItemQuantity,
        removeItem,
        emptyCart
    } = useCart();

    if (isEmpty) return <p>Your cart is empty</p>;

    return (
        <>
                <PageContent>
      <Section className='DfContentPage DfEntireProduct'> {/* TODO Maybe delete <Section /> because <PageContent /> includes it */}

            <h1>
                Checkout / Ordering ({totalUniqueItems} - {cartTotal})
          </h1>

       
            </Section>
            </PageContent>
        </>
    );
}

export default Checkout;

