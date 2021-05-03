import React, { useState, useCallback } from 'react'
import { ViewStorefront } from '../storefronts/ViewStorefront'
import { Segment } from 'src/components/utils/Segment'
import { Tabs } from 'antd'
import { ElasticIndex, ElasticIndexTypes } from '@darkpay/dark-types/offchain/search'
import { useRouter } from 'next/router'
import Section from '../utils/Section'
import { ProfilePreviewWithOwner } from '../profiles/address-views'
import { DataListOptProps } from '../lists/DataList'
import { queryElasticSearch } from 'src/components/utils/OffchainUtils'
import { InfiniteListByData, InnerLoadMoreFn, RenderItemFn } from '../lists/InfiniteList'
import ProductPreview from '../products/view-product/ProductPreview'
import { AnyDarkdotData, ProductWithAllDetails, ProfileData, StorefrontData } from '@darkpay/dark-types'

const { TabPane } = Tabs

type DataResults = {
  index: string
  id: string
  data: (AnyDarkdotData | ProductWithAllDetails)[]
}

const AllTabKey = 'all'

const panes = [
  {
    key: AllTabKey,
    title: 'All'
  },
  {
    key: 'storefronts',
    title: 'Storefronts'
  },
  {
    key: 'products',
    title: 'Products'
  },
  {
    key: 'profiles',
    title: 'Profiles'
  }
]

const resultToPreview = ({ data, index, id }: DataResults, i: number) => {
  const unknownData = data as unknown
  switch (index) {
    case ElasticIndex.storefronts:
      return <ViewStorefront key={`${id}-${i}`} storefrontData={unknownData as StorefrontData} preview withFollowButton />
    case ElasticIndex.products: {
      const productData = unknownData as ProductWithAllDetails
      return <ProductPreview key={productData.product.struct.id.toString()} productDetails={productData} withActions />
    }
    case ElasticIndex.profiles:
      return (
        <Segment>
          <ProfilePreviewWithOwner key={`${id}-${i}`} address={id} owner={unknownData as ProfileData} />
        </Segment>
      )
    default:
      return <></>
  }
}

type InnerSearchResultListProps<T> = DataListOptProps & {
  loadingLabel?: string
  renderItem: RenderItemFn<T>
}

const InnerSearchResultList = <T extends DataResults>(props: InnerSearchResultListProps<T>) => {
  const router = useRouter()

  const getReqParam = (param: 'tab' | 'q' | 'tags') => {
    return router.query[param]
  }

  const querySearch: InnerLoadMoreFn<T> = async (page, size) => {
    const tab = getReqParam('tab') as ElasticIndexTypes[]
    const query = getReqParam('q') as string
    const tags = getReqParam('tags') as string[]
    const offset = (page - 1) * size

    const res = await queryElasticSearch({
      indexes: tab || AllTabKey,
      q: query,
      tags,
      offset,
      limit: size,
    })

    return res
  }

  const List = useCallback(() =>
    <InfiniteListByData {...props} loadMore={querySearch} />,
    [ router.asPath ]
  )

  return <List />
}

const AllResultsList = () => (
  <InnerSearchResultList loadingLabel={'Loading search results...'} renderItem={resultToPreview} />
)

const ResultsTabs = () => {
  const router = useRouter()

  const getTabIndexFromUrl = (): number => {
    const tabFromUrl = router.query.tab
    const tabIndex = panes.findIndex(pane => pane.key === tabFromUrl)
    return tabIndex < 0 ? 0 : tabIndex
  }

  const initialTabIndex = getTabIndexFromUrl()
  const initialTabKey = panes[initialTabIndex].key

  const [activeTabKey, setActiveTabKey] = useState(initialTabKey)

  const handleTabChange = (key: string) => {
    setActiveTabKey(key)

    const newPath = {
      pathname: router.pathname,
      query: {
        ...router.query,
        tab: key
      }
    }

    router.push(newPath, newPath)
  }

  return (
    <Tabs onChange={handleTabChange} activeKey={activeTabKey.toString()}>
      {panes.map(({ key, title }) => (
        <TabPane key={key} tab={title}>
          <AllResultsList />
        </TabPane>
      ))}
    </Tabs>
  )
}

const SearchResults = () => {
  return (
    <Section>
      <ResultsTabs />
    </Section>
  )
}

export default SearchResults
