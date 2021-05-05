import { getLoadMoreFeedFn, FeedActivities } from "./FeedActivities"
import { BaseActivityProps } from "./types"
import { getFeedCount, getNewsFeed } from "../utils/OffchainUtils"
import { useMyAddress } from "../auth/MyAccountContext"
import NotAuthorized from "../auth/NotAuthorized"
import HeadMeta from "../utils/HeadMeta"

const TITLE = 'My feed'
const loadingLabel = 'Loading your feed...'

type MyFeedProps = {
  title?: string
}

const loadMoreFeed = getLoadMoreFeedFn(getNewsFeed, 'product_id')

export const InnerMyFeed = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMoreFeed}
  loadingLabel={loadingLabel}
  noDataDesc='Nothing to see here... Please subscribe to active storefronts.'
  getCount={getFeedCount}
/>


export const MyFeed = ({ title }: MyFeedProps) => {
  const myAddress = useMyAddress()

  if (!myAddress) return <NotAuthorized />

  return <>
    <HeadMeta title={TITLE} />
    <InnerMyFeed title={title} address={myAddress} />
  </>
}

export default MyFeed
