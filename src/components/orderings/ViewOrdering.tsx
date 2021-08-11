import { GenericAccountId as AccountId } from '@polkadot/types';
import { OrderingContent } from '@darkpay/dark-types/offchain';
import { nonEmptyStr, isEmptyStr, newLogger } from '@darkpay/dark-utils';
import BN from 'bn.js';
import { mdToText } from 'src/utils';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Error from 'next/error';
import React, { useCallback } from 'react';
import { Segment } from 'src/components/utils/Segment';
import { isHidden, resolveBn } from '../utils';
import { HeadMeta } from '../utils/HeadMeta';
import { SummarizeMd } from '../utils/md';
import MyEntityLabel from '../utils/MyEntityLabel';
import { return404 } from '../utils/next';
import Section from '../utils/Section';
import { getDarkdotApi } from '../utils/DarkdotConnect';
import ViewTags from '../utils/ViewTags';
//import OrderingStatsRow from './OrderingStatsRow';
import { ViewOrderingProps } from './ViewOrderingProps';
//import withLoadOrderingDataById from './withLoadOrderingDataById';
//import AboutOrderingLink from './AboutOrderingLink';
import ViewOrderingLink from './ViewOrderingLink';
import { PageContent } from '../main/PageWrapper';
import { DropdownMenu, ProductPreviewsOnOrdering, OrderingNotFound, OrderingBanner, isMyOrdering } from './helpers';
//import { ContactInfo } from './SocialLinks/ViewSocialLinks';
import { MutedSpan } from '../utils/MutedText';
import { BareProps } from '../utils/types';
import { getPageOfIds } from '../utils/getIds';
import { editOrderingUrl, orderingIdForUrl } from '../urls';
import ButtonLink from '../utils/ButtonLink';
import { EditOutlined } from '@ant-design/icons';
import { getOrderingId } from '../substrate';
import { withLoadOrderingDataById } from './withLoadOrderingDataById';
//import { EntityStatusGroup, PendingOrderingOwnershipPanel } from '../utils/EntityStatusPanels';

// import { OrderingHistoryModal } from '../utils/ListsEditHistory';
//const FollowOrderingButton = dynamic(() => import('../utils/FollowOrderingButton'), { ssr: false });

type Props = ViewOrderingProps

export const ViewOrdering = (props: Props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { orderingData } = props;

  

  if (!orderingData || !orderingData?.struct) {
    return <OrderingNotFound />
  }

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    withFollowButton = true,
    withStats = true,
    withTags = true,
    dropdownPreview = false,
    productIds = [],
    products = [],
    onClick,
    imageSize = 64
  } = props;

  const ordering = orderingData.struct;

  const {
    id,
    owner
  } = ordering;

  const { address1, address2, postal_code, city, country, orderingcontent_total, orderingcontent_state} = orderingData?.content || {} as OrderingContent

  const orderingState = orderingData.struct.id

  const orderingName = isEmptyStr(orderingState) ? <MutedSpan>{'<Unnamed Ordering>'}</MutedSpan> : orderingState

  const Banner = useCallback(() => <OrderingBanner ordering={ordering} address={owner} size={imageSize} />, [])

  const isMy = isMyOrdering(ordering)

  const primaryClass = `ProfileDetails ${isMy && 'MyOrdering'}`

  const OrderingNameAsLink = (props: BareProps) =>
    <ViewOrderingLink ordering={ordering} {...props} />

  const renderNameOnly = () =>
    withLink
      ? <OrderingNameAsLink />
      : <span>{orderingIdForUrl(ordering)}</span>

  const renderDropDownPreview = () =>
    <div className={`${primaryClass} DfPreview`}>
      <Banner />
      <div className='content'>
        <div className='handle'>{orderingName}</div>
      </div>
    </div>

  const renderMiniPreview = () =>
    <div className={'viewordering-minipreview'}>
      <div onClick={onClick} className={primaryClass}>
        <Banner />
        <div className='content'>
          <div className='handle'>{orderingName}</div>
        </div>
      </div>
    </div>

  const title = React.createElement(
    preview ? 'span' : 'h1',
    { className: 'header'},
    <>
      <OrderingNameAsLink className='mr-3' />
      <MyEntityLabel isMy={isMy}>{orderingData.struct.id} - {orderingData.struct.storefront_id} | $ {orderingData.struct.ordering_total} | {orderingData.content?.address1} - {orderingData.content?.country}</MyEntityLabel>
      <MyEntityLabel isMy={isMy}>{orderingData.struct.ordering_state}</MyEntityLabel>

    </>
  );

  const renderPreview = () =>
    <div className={primaryClass}>
  
      <div className='DfOrderingBody'>

        <div className='ml-2 w-100'>
          
          <div className='d-flex justify-content-between'>
            {title}
            <span className='d-flex align-items-center'>
              <DropdownMenu className='mx-2' orderingData={orderingData} />
              {isMy &&
                <ButtonLink href={`/[orderingId]/edit`} className='mr-2 bg-transparent'>
                  <EditOutlined /> Edit
                </ButtonLink>
              }

            </span>
          </div>
          <div className='DfOrderingBannerFull'>
        <Banner />
        </div>

        </div>
      </div>
    </div>

  if (nameOnly) {
    return renderNameOnly();
  } else if (dropdownPreview) {
    return renderDropDownPreview();
  } else if (miniPreview) {
    return renderMiniPreview();
  } else if (preview) {
    return <Segment>

      {renderPreview()}
    </Segment>;
  }

  return <>
    <PageContent>
      <Section>{renderPreview()}</Section>
      <Section className='DfContentPage mt-4'>
        <ProductPreviewsOnOrdering orderingData={orderingData} products={products} productIds={productIds} />
      </Section>
    </PageContent>
  </>
}

const log = newLogger('ViewOrdering.tsx')
// TODO extract getInitialProps, this func is similar in AboutOrdering

const ViewOrderingPage: NextPage<Props> = (props) => {
  const { orderingData } = props



  if (!orderingData || !orderingData.content) {
    return null
  }

  const id = resolveBn(orderingData.struct.id)
  const {  address1, address2, postal_code, city, country, ...contactInfo } = orderingData.content

  // Simple check (should be imroved later)
  const isPolkaProject = id.eqn(1) || (id.gtn(1000) && id.ltn(1218))

  // Need to add this to a title to improve SEO of Polkadot projects.
  const title = name + (isPolkaProject ? ' - Polkadot ecosystem projects' : '')

  return <>
    <HeadMeta title={title}  />
    <ViewOrdering {...props} />
  </>
}

ViewOrderingPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const { orderingId } = query
  const idOrHandle = orderingId as string

  const id = await getOrderingId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot

  const orderingData = id && await darkdot.findOrdering(id)
  

  if (!orderingData?.struct) {
    return return404(props)
  }

  const ownerId = orderingData?.struct.owner as AccountId
  const owner = await darkdot.findProfile(ownerId)

  // We need to reverse product ids to display products in a descending order on a ordering page.
  const productIds = orderingData.struct; //(await substrate.productIdsByOrderingId(id as BN)).reverse()
  const pageIds = getPageOfIds(productIds, query)
  const products = await darkdot.findPublicProductsWithAllDetails(pageIds)

  return {
    orderingData,
    products,
    productIds,
    owner
  }
}

export default ViewOrderingPage

export const DynamicViewOrdering = withLoadOrderingDataById(ViewOrdering)
