
import { useCart } from "react-use-cart";
import { resolveIpfsUrl } from "src/ipfs";
import { PageContent } from "../main/PageWrapper";
import Section from "../utils/Section";
import React, { useState } from 'react'
import { Form, Input, Select, Table, Tag, Space } from 'antd'
import BN from 'bn.js'
import { getNewIdFromEvent, equalAddresses, stringifyText, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { OrderingUpdate, OrderingStates, OrderingState, OptionBool, OptionIpfsContent, OptionOptionText, OptionText, OptionId, IpfsContent, None } from '@darkpay/dark-types/substrate/classes'
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
import { Countries } from '../utils/Countries'
import { getNonEmptyOrderingContent } from "../utils/content";
import { Router } from "next/router";
import { HeadMeta } from "../utils/HeadMeta";
// import EmptyCart from "./EmptyCart";






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


// Delivery address form
export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs, substrate } = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()


  const { ordering, minHandleLen, maxHandleLen } = props


  const {emptyCart, metadata, addItem } = useCart()

  const initialValues = '' // New order has no initialvalues
  // TODO : get values from previous order/local storage
  const body = ''
  const address1 = ''
  const address2 = ''
  const postal_code = ''
  const city = ''
  const country = ''
  const send_proof_image = ''
  const email = ''
  const bescrow = 0
  const sescrow = 0
  const orderingcontent_state = 'New'
  const orderingcontent_total = 0


  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  // New order TX
  const newTxParams = (cid: IpfsCid) => {
    const fieldValues = getFieldValues()

    /** Returns `undefined` if value hasn't been changed. */
    function getValueIfChanged (field: FieldName): any | undefined {
      return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    }

      // If creating a new order.
      // pub fn create_order(
      //   origin,
      //   storefront_id: StorefrontId,
      //   product_id: ProductId,
      //   order_total: BalanceOf<T>,
      //   seller: T::AccountId,
      //   buyer_escrow: BalanceOf<T>,
      //   seller_escrow: BalanceOf<T>,
      //   content: Content
      const sfId = 1001
      //const pId = 3
      const price = 7
      const qty = 1
      const shipcost = 10
      const shipsto = ''
      const order_total = price * 100
      const seller = '2khBcSFnYJk2FjeeYRo9946SMrboa7rqHmtycgBM7JyEiTyN'
      const bescrow = 1
      const sescrow = 1
      const pids = [1,3]
      // TODO
//      return [ sfId, new IpfsContent(cid), Number(order_total), seller, Number(bescrow), Number(sescrow), pids  ]
return [ sfId, new IpfsContent(cid), Number(order_total), seller, Number(bescrow), Number(sescrow) ]

  }



  const fieldValuesToContent = (): Content =>
    getNonEmptyOrderingContent(getFieldValues() as Content)

  // TODO pin to IPFS only if JSON changed.
  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: fieldValuesToContent(),
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch((err: string | undefined) => new Error(err))
  }

  const onSuccess: TxCallback = (txResult) => {
    const id = getNewIdFromEvent(txResult)
    id && goToView(id)
  }

 

  const goToView = (orderingId: BN) => {
    // Router.push('/[orderingId]', `/${orderingId}`)
    //   .catch(err => log.error(`Failed to redirect to a storefront page. ${err}`))
    console.warn('$$$$$$$$$ ORdering ID === ' + orderingId);
    let metaCart : any = metadata
    
    let forLaterCart : any = metaCart['for_later']
   
    // empty cart
    emptyCart()

    for(var i = 0; i < forLaterCart.length; i++){
      if(forLaterCart[i] instanceof Array){
        let forLater : any = forLaterCart[i]
        forLater.forEach((entry: any) => {
          console.warn(entry.id);
          addItem(entry)
      });      }else{
          console.warn(forLaterCart[i]);
      }
    }

    
    
  }

  // const onDescChanged = (mdText: string) => {
  //   form.setFieldsValue({ [fieldName('body')]: mdText })
  // }






  return <>
              
 


    <DfForm form={form} validateTrigger={[ 'onBlur' ]} >




      <Form.Item label="Delivery Address">

        <Input.Group>
        <Form.Item
            name={fieldName('address1')}
            noStyle
            rules={[{ required: true, message: 'A delivery address is mandatory !' }]}
          >
            <Input style={{ width: '100%' }} placeholder="Number, Street, Apt." />
          </Form.Item>
          <Form.Item
            name={fieldName('address2')}
            noStyle
            rules={[{ required: false, message: 'Enter State or any relevant address info' }]}
          >
            <Input style={{ width: '100%' }} placeholder="State or any other relevant address info" />
          </Form.Item>
        <Form.Item
        name={fieldName('postal_code')}
        label='Postal Code'
        noStyle
        hasFeedback
        rules={[
          { required: true, message: 'Postal Code is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input style={{ width: '50%' }}  placeholder='Your zip/postal code' />
      </Form.Item>
      <Form.Item
        name={fieldName('city')}
        label='City'
        noStyle
        hasFeedback
        rules={[
          { required: true, message: 'City is required.' },
        ]}
      >
        <Input style={{ width: '50%' }}  placeholder='Your city' />
      </Form.Item>    
          <Form.Item
        name={fieldName('country')}
            label='Country'
            noStyle
            rules={[{ required: true, message: 'Country is required' }]}
          >
            <Select style={{ width: '50%' }} placeholder="Select country">
          {Object.keys(Countries).map(key => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
            </Select>
          </Form.Item>
  
        </Input.Group>
      </Form.Item>


      {/* <Form.Item
        name={fieldName('body')}
        label='Memo'
        hasFeedback
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Memo', DESC_MAX_LEN) }
        ]}
      >
      </Form.Item> */}



      {/* <Form.Item
        name={fieldName('email')}
        label={<span><MailOutlined /> Email address</span>}
        rules={[
          { pattern: /\S+@\S+\.\S+/, message: 'Should be a valid email' }
        ]}>
        <Input type='email' placeholder='Email address' />
      </Form.Item> */}

      <DfFormButtons
        form={form}
        txProps={{
          label: 'Create new order',
          tx: 'orderings.createOrdering',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
} // end innerform 


// Form in section
export function FormInSection (props: Partial<FormProps>) {
  const [ consts ] = useState<ValidationProps>({
    minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.storefronts.minHandleLen, 5),
    maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.storefronts.maxHandleLen, 50)
  })
  const { ordering } = props
  const title = `New order`

  // useDarkdotEffect(({ substrate }) => {
  //   const load = async () => {
  //     // const api = await substrate.api
  //     setConsts({
  //       minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.storefronts.minHandleLen, 5),
  //       maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.storefronts.maxHandleLen, 50)
  //     })
  //   }
  //   load()
  // }, [])

  return <>
    <HeadMeta title={title} />
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} {...consts} />
    </Section>
  </>
}



// Checkout page
export const Checkout = FormInSection

export default Checkout 

