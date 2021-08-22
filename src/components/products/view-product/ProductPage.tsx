import React from 'react';
import dynamic from 'next/dynamic';
import { DfMd } from '../../utils/DfMd';
import { HeadMeta } from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { ProductData, ProductWithAllDetails } from '@darkpay/dark-types/dto';
import ViewTags from '../../utils/ViewTags';
import ViewProductLink from '../ViewProductLink';
import { CommentSection } from '../../comments/CommentsSection';
import { ProductDropDownMenu, ProductCreator, HiddenProductAlert, ProductNotFound, ProductActionsPanel, isComment, ShareProductContent, useSubscribedProduct } from './helpers';
import Error from 'next/error'
import { NextPage } from 'next';
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';
import { getStorefrontId, unwrapSubstrateId } from 'src/components/substrate';
import partition from 'lodash.partition';
import BN from 'bn.js'
import { PageContent } from 'src/components/main/PageWrapper';
import { isHidden, Loading } from 'src/components/utils';
import { useLoadUnlistedStorefront, isHiddenStorefront } from 'src/components/storefronts/helpers';
import { resolveIpfsUrl } from 'src/ipfs';
import { useResponsiveSize } from 'src/components/responsive';
import { mdToText } from 'src/utils';
import { ViewStorefront } from 'src/components/storefronts/ViewStorefront';
// import { KusamaProposalView } from 'src/components/kusama/KusamaProposalDesc';
const StatsPanel = dynamic(() => import('../ProductStats'), { ssr: false });
import AddToCartWidget from '../../cart/AddToCartWidget'
import ProductPriceToDark from './ProductPriceToDark';
import ViewShipCountries from 'src/components/utils/ViewShipCountries';
import ViewShipCost from 'src/components/utils/ViewShipCost';
import { Descriptions, Space } from 'antd';


export type ProductDetailsProps = {
  productDetails: ProductWithAllDetails,
  statusCode?: number,
  replies: ProductWithAllDetails[]
}

export const ProductPage: NextPage<ProductDetailsProps> = ({ productDetails: initialProduct, replies, statusCode }) => {
  if (statusCode === 404) return <Error statusCode={statusCode} />
  if (!initialProduct || isHidden({ struct: initialProduct.product.struct })) return <ProductNotFound />

  const { product, ext, storefront } = initialProduct

  if (!storefront || isHiddenStorefront(storefront.struct)) return <ProductNotFound />

  const { struct: initStruct, content } = product;

  if (!content) return null;

  const { isNotMobile } = useResponsiveSize()
  const struct = useSubscribedProduct(initStruct)
  const productDetails = { ...initialProduct, product: { struct, content } }

  const storefrontData = storefront || productDetails.storefront || useLoadUnlistedStorefront(struct.owner).myHiddenStorefront

  const { title, body, image, canonical, tags } = content;

  if (!storefrontData) return <Loading />

  const storefrontStruct = storefrontData.struct;

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentProduct?: ProductData) => parentProduct && <>
      In response to{' '}
    <ViewProductLink storefront={storefrontStruct} product={parentProduct.struct} title={parentProduct.content?.title} />
  </>

  const titleMsg = isComment(struct.extension)
    ? renderResponseTitle(productDetails.ext?.product)
    : title

const productPriceView = ((product.struct.price_usd as any)/100).toFixed(2)


  return <>
    <PageContent>
      <HiddenProductAlert product={product.struct} />
      <Section className='DfContentPage DfEntireProduct'> {/* TODO Maybe delete <Section /> because <PageContent /> includes it */}
        <HeadMeta title={title} desc={mdToText(body)} image={image} canonical={canonical} tags={tags} />
        <div className='DfRow'>
          <h1 className='DfProductName'>{titleMsg}</h1>
          <ProductDropDownMenu productDetails={productDetails} storefront={storefrontStruct} withEditButton />
        </div>


        {/* <KusamaProposalView proposal={content.ext?.proposal} /> */}
        <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
          <div> <h3 className='fullProductViewPrice'>{productPriceView} $</h3>
           <ProductPriceToDark product={productDetails.product} /></div>
         
          <div className='addtocartRow'>
            <AddToCartWidget storefront={storefrontStruct} product={productDetails.product} productdetails ={productDetails} title='Add to cart' />
          </div>
        </Space>

        <div className='DfProductContent'>
          {ext
            ? <ShareProductContent productDetails={productDetails} storefront={storefront} />
            : <>
              {image && <div className='d-flex justify-content-center'>
                <img src={resolveIpfsUrl(image)} className='DfProductImage' /* add onError handler */ />
              </div>}
              {body && <DfMd source={body} />}
              <ViewTags tags={tags} className='mt-1' />
              {/* <ViewShipCost shipcost={(parseFloat(struct.ship_cost.toString())/100)} />
              <ViewShipCountries countries={content?.shipsto} /> */}
            </>}
        </div>
        <div className='DfProductContent'>
                 <Descriptions title="Additional info" bordered>
                   <Descriptions.Item label="Taxes" span={3}>20 %</Descriptions.Item>
                   <Descriptions.Item label="Shipping cost" span={3}><ViewShipCost shipcost={(parseFloat(struct.ship_cost.toString())/100)} /></Descriptions.Item>
                   <Descriptions.Item label="Ships to" span={3}><ViewShipCountries countries={content?.shipsto} /></Descriptions.Item>
                   <Descriptions.Item label="Buyer escrow" span={3}>50%</Descriptions.Item>
                   <Descriptions.Item label="Seller escrow" span={3}>50%</Descriptions.Item>
                 </Descriptions>
        </div>
        <div className='DfProductContent'>
        <div className="ant-descriptions-header"><div className="ant-descriptions-title">Feedback & comments</div></div>

          { <ProductCreator productDetails={productDetails} withStorefrontName storefront={storefrontData} /> }
          {isNotMobile && <StatsPanel id={struct.id} goToCommentsId={goToCommentsId} />}
          <CommentSection product={productDetails} hashId={goToCommentsId} replies={replies} storefront={storefrontStruct} />

        </div>
        <div className='DfProductContent'>
          <ProductActionsPanel productDetails={productDetails} storefront={storefront.struct} />
        </div>

        <div className='DfProductContent'>
        <div className="ant-descriptions-header"><div className="ant-descriptions-title">Related storefront</div></div>

          <ViewStorefront
            storefrontData={storefrontData}
            withFollowButton
            withTags={false}
            withStats={false}
            preview
          />
        </div>

      </Section>
    </PageContent>
  </>
};

ProductPage.getInitialProps = async (props): Promise<any> => {
  const { query: { storefrontId, productId }, res } = props;
  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot;
  const idOrHandle = storefrontId as string
  const storefrontIdFromUrl = await getStorefrontId(idOrHandle)

  const productIdFromUrl = new BN(productId as string)
  const replyIds = await substrate.getReplyIdsByProductId(productIdFromUrl)
  const comments = await darkdot.findPublicProductsWithAllDetails([ ...replyIds, productIdFromUrl ])

  const [ extProductsData, replies ] = partition(comments, x => x.product.struct.id.eq(productIdFromUrl))
  const extProductData = extProductsData.pop() || await darkdot.findProductWithAllDetails(productIdFromUrl)

  const storefrontIdFromProduct = unwrapSubstrateId(extProductData?.product.struct.storefront_id)
  // If a storefront id of this product is not equal to the storefront id/handle from URL,
  // then redirect to the URL with the storefront id of this product.
  if (storefrontIdFromProduct && storefrontIdFromUrl && !storefrontIdFromProduct.eq(storefrontIdFromUrl) && res) {
    res.writeHead(301, { Location: `/${storefrontIdFromProduct.toString()}/products/${productId}` })
    res.end()
  }

  return {
    productDetails: extProductData,
    replies
  }
};

export default ProductPage
