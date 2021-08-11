import React, { useState } from 'react'
import { Form, InputNumber, Select, Slider, Tabs } from 'antd'
import Router, { useRouter } from 'next/router'
import BN from 'bn.js'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getNewIdFromEvent, equalAddresses, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { ProductExtension, ProductUpdate, OptionId, OptionBool, OptionIpfsContent, IpfsContent, OptionPrice} from '@darkpay/dark-types/substrate/classes'
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces'
import { ProductContent, ProductData, ProductExt } from '@darkpay/dark-types'
import { registry } from '@darkpay/dark-types/substrate/registry'
import { newLogger } from '@darkpay/dark-utils'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import useDarkdotEffect from '../api/useDarkdotEffect'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'
import { i32, Null } from '@polkadot/types'
import DfMdEditor from '../utils/DfMdEditor/client'
import StorefrontgedSectionTitle from '../storefronts/StorefrontdSectionTitle'
import { withLoadStorefrontFromUrl, CanHaveStorefrontProps } from '../storefronts/withLoadStorefrontFromUrl'
import { UploadCover } from '../uploader'
import { getNonEmptyProductContent } from '../utils/content'
import messages from 'src/messages'
import { PageContent } from '../main/PageWrapper'
// import { useKusamaContext } from '../kusama/KusamaContext'
import Input from 'antd/lib/input/Input'
import { Countries } from '../utils/Countries'
// import { KusamaProposalForm } from '../kusama/KusamaEditProduct'

const { TabPane } = Tabs

const log = newLogger('EditProduct')

const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 100

const BODY_MAX_LEN = 100_000 // ~100k chars

const MAX_TAGS = 10

type Content = ProductContent

type FormValues = Partial<Content & {
  storefrontId: string,
  proposalIndex?: number
  price?: number
  bescrow?: number
  sescrow?: number
  shipcost?: number
  taxpct?: number
  discountpct?: number
  shipsto?: string[]
  size?: string
  color?: string
}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

export type ProductFormProps = CanHaveStorefrontProps & {
  product?: ProductData
  /** Storefronts where you can product. */
  storefrontIds?: BN[],
  ext?: ProductExt
}

export function getInitialValues ({ storefront, product }: ProductFormProps): FormValues {
  if (storefront && product) {
    const storefrontId = storefront.struct.id.toString()
    return { ...product.content, storefrontId }
  }
  return {}
}

const RegularProductExt = new ProductExtension({ RegularProduct: new Null(registry) })

export function ProductForm (props: ProductFormProps) {
  const { storefront, product, ext } = props
  const [ form ] = Form.useForm()
  const { ipfs } = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()
  const [ price, setPrice ] = useState<i32 | number | undefined>()
  const [ bescrow, setBescrow ] = useState<i32 | number | undefined>()
  const [ sescrow, setSescrow ] = useState<i32 | number | undefined>()
  const [ shipcost, setShipcost ] = useState<i32 | number | undefined>()
  const [ taxpct, setTaxpct ] = useState<i32 | number |undefined>()
  const [ discountpct, setDiscountpct ] = useState<i32 | number | undefined>()

  if (!storefront) return <NoData description='Storefront not found' />

  const storefrontId = storefront.struct.id
  const initialValues = getInitialValues(props)

  const tags = initialValues.tags || []
  const orig_price = Number(props.product?.struct.price_usd) || 0
  const orig_bescrow =  Number(props.product?.struct.buyer_esc_pct)/100 || 50
  const orig_sescrow =  Number(props.product?.struct.seller_esc_pct)/100 || 50
  const orig_shipcost =  Number(props.product?.struct.ship_cost)/100 || 0
  const orig_taxpct =   Number(props.product?.struct.tax_pct)/100 || 0
  const orig_discountpct =   Number(props.product?.struct.discount_pct)/100 || 0
  //const orig_variations = initialValues.variations || []

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    if (!product) {
      //console.log(form.getFieldValue([fieldName('price')]))
      //   price_usd: Option<i32>,
        // tax_pct: Option<i32>,
        // discount_pct: Option<i32>,
        // buyer_esc_pct: Option<i32>,
        // seller_esc_pct: Option<i32>,
      // If creating a new product.
      return [ storefrontId, RegularProductExt, new IpfsContent(cid), Number(price)*100, Number(taxpct)*100, Number(discountpct)*100, Number(bescrow)*100, Number(sescrow)*100, Number(shipcost)*100]
    } else {

      // TODO Update only changed values.

      const update = new ProductUpdate({
        // If we provide a new storefront_id in update, it will move this product to another storefront.
        storefront_id: new OptionId(),
        content: new OptionIpfsContent(cid),
        price_usd: new OptionPrice(convertPrice(price)),
        tax_pct: new OptionPrice(convertPrice(taxpct)),
        discount_pct: new OptionPrice(convertPrice(discountpct)),
        buyer_esc_pct: new OptionPrice(convertPrice(bescrow)),
        seller_esc_pct: new OptionPrice(convertPrice(sescrow)),
        ship_cost: new OptionPrice(convertPrice(shipcost)),
        hidden: new OptionBool(false), // TODO has no implementation on UI
      })
      return [ product.struct.id, update ]
    }
  }


  const convertPrice = (price: any): any => {
    return (price * 100);
  };

  const fieldValuesToContent = (): Content =>
    getNonEmptyProductContent({ ...getFieldValues(), ext } as Content)

  const pinToIpfsAndBuildTxParams = () => {

    // TODO pin to IPFS only if JSON changed.

    return getTxParams({
      json: fieldValuesToContent(),
      buildTxParamsCallback: newTxParams,
      setIpfsCid,
      ipfs
    })
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = (txResult) => {
    const id = product?.struct.id || getNewIdFromEvent(txResult)
    id && goToView(id)
  }

  const goToView = (productId: BN) => {
    Router.push('/[storefrontId]/products/[productId]', `/${storefrontId}/products/${productId}`)
      .catch(err => log.error(`Failed to redirect to a product page. ${err}`))
  }

  const onBodyChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('body')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }


  const onPriceChanged = (price: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('price')]: price })
    console.log('Price is ---> '+price)
    setPrice(Number(price))
  }

  const onBescrowChanged = (bescrow: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('bescrow')]: bescrow })
    setBescrow(Number(bescrow))
  }

  const onSescrowChanged = (sescrow: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('sescrow')]: sescrow })
    setSescrow(Number(sescrow))
  }

  const onShipcostChanged = (shipcost: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('shipcost')]: shipcost })
    setShipcost(Number(shipcost))
  }
  
  const onTaxpctChanged = (taxpct: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('taxpct')]: taxpct })
    setTaxpct(Number(taxpct))
  }

  const onDiscountpctChanged = (discountpct: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('discountpct')]: taxpct })
    setDiscountpct(Number(discountpct))
  }

  return <>
    <DfForm form={form} initialValues={initialValues}>
      <Form.Item
        name={fieldName('title')}
        label='Product title'
        hasFeedback
        rules={[
           { required: true, message: 'Product title is required.' },
          { min: TITLE_MIN_LEN, message: minLenError('Product title', TITLE_MIN_LEN) },
          { max: TITLE_MAX_LEN, message: maxLenError('Product title', TITLE_MAX_LEN) }
        ]}
      >
        <Input placeholder='A short title for your product' />
      </Form.Item>

      <Form.Item
      label='Price (USD)'
      >
      <InputNumber
      name={fieldName('price')}
      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={orig_price/100}
      step='0.01'
      style={{
        width: 200,
      }}
      onChange = {onPriceChanged}
    />
    </Form.Item>

      <Form.Item
        name={fieldName('image')}
        label='Product Image'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadCover onChange={onAvatarChanged} img={initialValues.image} />
      </Form.Item>

      <Form.Item
        name={fieldName('body')}
        label='Product Description'
        hasFeedback
        rules={[
          { required: true, message: 'Product description is required.' },
          { max: BODY_MAX_LEN, message: maxLenError('Product body', BODY_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onBodyChanged} />
      </Form.Item>

      <Form.Item
        name={fieldName('tags')}
        label='Tags'
        hasFeedback
        rules={[
          { type: 'array', max: MAX_TAGS, message: `You can use up to ${MAX_TAGS} tags.` }
        ]}
      >
        <Select
          mode='tags'
          placeholder="Press 'Enter' or 'Tab' key to add tags"
        >
          {tags.map((tag, i) =>
            <Select.Option key={i} value={tag} >{tag}</Select.Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        name={fieldName('shipsto')}
            label='Ships to'
            rules={[{ required: true, message: 'Country is required' }]}
          >
            <Select style={{ width: '50%' }} mode="multiple" placeholder="Select countries">
          {Object.keys(Countries).map(key => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
            </Select>
            
      </Form.Item>

      <Form.Item
      label='Shipping Cost (USD)'
      >
      <InputNumber
      name={fieldName('shipcost')}
      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={Number(orig_shipcost)}
      step='0.01'
      style={{
        width: 200,
      }}
      onChange = {onShipcostChanged}
    />
    </Form.Item>

      <Form.Item
      name={fieldName('bescrow')}
      label='Escrow % for Buyer'
      >
      <Slider
            min={30}
            max={70}
            defaultValue={Number(orig_bescrow)}
            onChange={onBescrowChanged}
          />
      </Form.Item>

      <Form.Item
      name={fieldName('sescrow')}
      label='Escrow % for You'
      >
      <Slider
            min={30}
            max={70}
            defaultValue={Number(orig_sescrow)}
            onChange={onSescrowChanged}
          />
      </Form.Item>

      <Form.Item
      label='Tax %'
      >
      <InputNumber
      name={fieldName('taxpct')}
      formatter={value => `% ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={orig_taxpct}
      step='0.01'
      style={{
        width: 200,
      }}
      onChange = {onTaxpctChanged}
    />
      </Form.Item>

      <Form.Item
      label='Discount %'
      >
      <InputNumber
      name={fieldName('discountpct')}
      formatter={value => `% ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={orig_discountpct}
      step='0.01'
      style={{
        width: 200,
      }}
      onChange = {onDiscountpctChanged}
    />
      </Form.Item>



      <Form.Item
        name={fieldName('canonical')}
        label='External URL'
        help='If you run a regular website which shows the product, you may enter its link here.'
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid URL.' }
        ]}
      >
        <Input type='url' placeholder='URL of the external product page' />
      </Form.Item>

      {/* // TODO impl Move product to another storefront. See component SelectStorefrontPreview */}

      <DfFormButtons
        form={form}
        txProps={{
          label: product
            ? 'Update product'
            : 'Create product',
          tx: product
            ? 'products.updateProduct'
            : 'products.createProduct',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
}

export const ProductForms = (props: ProductFormProps) => {
  const { product } = props

  const defaultKey = (product?.content as any)?.proposal
    ? 'proposal'
    : 'regular'

  return <Tabs className='mb-0' defaultActiveKey={defaultKey}>
    <TabPane tab='Kusama proposal' key='proposal'>
      {/* <KusamaProposalForm {...props} /> */}
    </TabPane>
    <TabPane tab='Regular product' key='regular'>
      <ProductForm {...props} />
    </TabPane>
  </Tabs>
}

export function FormInSection (props: ProductFormProps) {
  const { storefront, product } = props
//  const { hasKusamaConnection } = useKusamaContext()
const useKusama = false

  const pageTitle = product ? `Edit product` : `New product`

  const sectionTitle =
    <StorefrontgedSectionTitle storefront={storefront} subtitle={pageTitle} />

  return <PageContent>
    <HeadMeta title={pageTitle} />
    <Section className='EditEntityBox' title={sectionTitle}>
      {/* {hasKusamaConnection */}
      {useKusama
        ? <ProductForms {...props} />
        : <ProductForm {...props} />}
    </Section>
  </PageContent>
}

function LoadProductThenEdit (props: ProductFormProps) {
  const { productId } = useRouter().query
  const myAddress = useMyAddress()
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ product, setProduct ] = useState<ProductData>()

  useDarkdotEffect(({ darkdot }) => {
    const load = async () => {
      if (typeof productId !== 'string') return

      setIsLoaded(false)
      const id = new BN(productId)
      console.log('********** LoadProductThenEdit for ID = '+id)
      setProduct(await darkdot.findProduct({ id }))
      setIsLoaded(true)
    }
    load()
  }, [ productId ])

  if (!isLoaded) return <Loading label='Loading the product...' />

  if (!product) return <NoData description='Product not found' />

  const productOwner = product.struct?.owner
  // const price = product.struct?.price_usd
  console.log('************ Loaded product : '+product.struct.content)
  const isOwner = equalAddresses(myAddress, productOwner)
  if (!isOwner) return <NoData description='You do not have permission to edit this product' />

  return <FormInSection {...props} product={product} />
}

export const EditProduct = withLoadStorefrontFromUrl(LoadProductThenEdit)

export const NewProduct = withLoadStorefrontFromUrl(FormInSection)

export default NewProduct
