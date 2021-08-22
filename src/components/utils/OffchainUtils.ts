import axios from 'axios';
import { offchainUrl } from './env';
import { Activity, Counts } from '@darkpay/dark-types/offchain';
import { newLogger, nonEmptyStr } from '@darkpay/dark-utils';
import { ElasticQueryParams } from '@darkpay/dark-types/offchain/search';

const log = newLogger('OffchainRequests')

function getOffchainUrl (subUrl: string): string {
  return `${offchainUrl}/v1/offchain${subUrl}`
}

const createActivitiesUrlByAddress = (address: string, entity: 'feed' | 'notifications' | 'activities') =>
  getOffchainUrl(`/${entity}/${address}`)

type ActivityType = 'follows' | 'products' | 'comments' | 'reactions' | 'storefronts' | 'counts'

const createNotificationsUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'notifications')
const createFeedUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'feed')
const createActivityUrlByAddress = (address: string, activityType?: ActivityType) => {
  const type = nonEmptyStr(activityType) ? `/${activityType}` : ''
  return `${createActivitiesUrlByAddress(address, 'activities')}${type}`
}

const axiosRequest = async (url: string) => {
  try {
    const res = await axios.get(url);
    if (res.status !== 200) {
      log.error('Failed request to offchain with status', res.status)
    }

    return res;
  } catch (err) {
      log.error('Failed request to offchain with error', err)
      return err
  }
}

const getActivity = async (url: string, offset: number, limit: number): Promise<Activity[]> => {
  try {
    const res = await axiosRequest(`${url}?offset=${offset}&limit=${limit}`)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get activities from offchain with error', err)
    return []
  }
}

const getCount = async (url: string): Promise<number> => {
  try {
    const res = await axiosRequest(`${url}/count`)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get count of activities from offchain with error', err)
    return 0
  }
}

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createFeedUrlByAddress(myAddress), offset, limit)
export const getFeedCount = async (myAddress: string) =>
  getCount(createFeedUrlByAddress(myAddress))

export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createNotificationsUrlByAddress(myAddress), offset, limit)
export const getNotificationsCount = async (myAddress: string) =>
  getCount(createNotificationsUrlByAddress(myAddress))

export const getActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress), offset, limit)
export const getActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress))

export const getCommentActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'comments'), offset, limit)
export const getCommentActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'comments'))

export const getProductActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'products'), offset, limit)
export const getProductActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'products'))

export const getReactionActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'reactions'), offset, limit)
export const getReactionActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'reactions'))

export const getFollowActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'follows'), offset, limit)
export const getFollowActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'follows'))

export const getStorefrontActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'storefronts'), offset, limit)
export const getStorefrontActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'storefronts'))

export const getActivityCounts = async (address: string): Promise<Counts> => {
  try {
    const res = await axiosRequest(`${createActivityUrlByAddress(address, 'counts')}`)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get count of activities from offchain with error', err)
    return {
      activitiesCount: 0,
      productsCount: 0,
      commentsCount: 0,
      storefrontsCount: 0,
      reactionsCount: 0,
      followsCount: 0,
      orderingsCount: 0
    }
  }
}

// TODO require refactor
export const clearNotifications = async (myAddress: string): Promise<void> =>{
  try {
    const res = await axios.post(getOffchainUrl(`/notifications/${myAddress}/readAll`));
    if (res.status !== 200) {
      console.warn('Failed to mark all notifications as read for account:', myAddress, 'res.status:', res.status)
    }
  } catch (err) {
    console.log(`Failed to mark all notifications as read for account: ${myAddress}`, err)
  }
}

export const queryElasticSearch = async (params: ElasticQueryParams): Promise<any> => {
  try {
    const res = await axios.get(getOffchainUrl(`/search`), { params })
    if (res.status === 200) {
      console.warn(res.data)
      return res.data
    }
  } catch (err) {
    console.error('Failed to query Elasticsearch:', err)
  }
}
