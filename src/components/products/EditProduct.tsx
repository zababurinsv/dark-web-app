import React, { useState } from 'react'
import { Form, Select, Tabs } from 'antd'
import Router, { useRouter } from 'next/router'
import BN from 'bn.js'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getNewIdFromEvent, equalAddresses, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { ProductExtension, ProductUpdate, OptionId, OptionBool, OptionIpfsContent, IpfsContent } from '@darkpay/dark-types/substrate/classes'
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
import { Null } from '@polkadot/types'
import DfMdEditor from '../utils/DfMdEditor/client'
import StorefrontgedSectionTitle from '../storefronts/StorefrontdSectionTitle'
import { withLoadStorefrontFromUrl, CanHaveStorefrontProps } from '../storefronts/withLoadStorefrontFromUrl'
import { UploadCover } from '../uploader'
import { getNonEmptyProductContent } from '../utils/content'
import messages from 'src/messages'
import { PageContent } from '../main/PageWrapper'
import { useKusamaContext } from '../kusama/KusamaContext'
import Input from 'antd/lib/input/Input'
import { KusamaProposalForm } from '../kusama/KusamaEditProduct'

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

  if (!storefront) return <NoData description='Storefront not found' />

  const storefrontId = storefront.struct.id
  const initialValues = getInitialValues(props)

  const tags = initialValues.tags || []

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    if (!product) {
      return [ storefrontId, RegularProductExt, new IpfsContent(cid) ]
    } else {

      // TODO Update only changed values.

      const update = new ProductUpdate({
        // If we provide a new storefront_id in update, it will move this product to another storefront.
        storefront_id: new OptionId(),
        content: new OptionIpfsContent(cid),
        hidden: new OptionBool(false) // TODO has no implementation on UI
      })
      return [ product.struct.id, update ]
    }
  }

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

  return <>
    <DfForm form={form} initialValues={initialValues}>
      <Form.Item
        name={fieldName('title')}
        label='Product title'
        hasFeedback
        rules={[
          // { required: true, message: 'Product title is required.' },
          { min: TITLE_MIN_LEN, message: minLenError('Product title', TITLE_MIN_LEN) },
          { max: TITLE_MAX_LEN, message: maxLenError('Product title', TITLE_MAX_LEN) }
        ]}
      >
        <Input placeholder='Optional: A title of your product' />
      </Form.Item>

      <Form.Item
        name={fieldName('image')}
        label='Cover'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadCover onChange={onAvatarChanged} img={initialValues.image} />
      </Form.Item>

      <Form.Item
        name={fieldName('body')}
        label='Product'
        hasFeedback
        rules={[
          { required: true, message: 'Product body is required.' },
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
        name={fieldName('canonical')}
        label='Original URL'
        help='This is the orginal URL of the place you first producted about this on another social media platform (i.e. Medium, Reddit, Twitter, etc.)'
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid URL.' }
        ]}
      >
        <Input type='url' placeholder='URL of the original product' />
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
      <KusamaProposalForm {...props} />
    </TabPane>
    <TabPane tab='Regular product' key='regular'>
      <ProductForm {...props} />
    </TabPane>
  </Tabs>
}

export function FormInSection (props: ProductFormProps) {
  const { storefront, product } = props
  const { hasKusamaConnection } = useKusamaContext()

  const pageTitle = product ? `Edit product` : `New product`

  const sectionTitle =
    <StorefrontgedSectionTitle storefront={storefront} subtitle={pageTitle} />

  return <PageContent>
    <HeadMeta title={pageTitle} />
    <Section className='EditEntityBox' title={sectionTitle}>
      {hasKusamaConnection
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
      setProduct(await darkdot.findProduct({ id }))
      setIsLoaded(true)
    }
    load()
  }, [ productId ])

  if (!isLoaded) return <Loading label='Loading the product...' />

  if (!product) return <NoData description='Product not found' />

  const productOwner = product.struct?.owner
  const isOwner = equalAddresses(myAddress, productOwner)
  if (!isOwner) return <NoData description='You do not have permission to edit this product' />

  return <FormInSection {...props} product={product} />
}

export const EditProduct = withLoadStorefrontFromUrl(LoadProductThenEdit)

export const NewProduct = withLoadStorefrontFromUrl(FormInSection)

export default NewProduct
