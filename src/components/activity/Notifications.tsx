import React from 'react';
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils';
import { DEFAULT_PAGE_SIZE } from 'src/config/ListData.config';
import { LoadMoreFn, ActivityStore, loadNotifications } from './NotificationUtils';

import { ProductData, StorefrontData, ProfileData } from '@darkpay/dark-types';
import { NotificationType } from './NotificationUtils';
import { Notification } from './Notification'
import { LoadMoreProps, BaseActivityProps, ActivityProps } from './types';
import { InnerActivities } from './InnerActivities';
type StructId = string

export const NotifActivities = ({ loadMore ,...props }: ActivityProps<NotificationType>) => {
  const activityStore: ActivityStore = {
    storefrontById: new Map<StructId, StorefrontData>(),
    productById: new Map<StructId, ProductData>(),
    ownerById: new Map<StructId, ProfileData>()
  }

  return <InnerActivities
    {...props}
    renderItem={(x: NotificationType, key) => <Notification key={key} {...x} />}
    loadMore={(props) => loadMore({ ...props, activityStore })}
  />
}

export type NotifActivitiesType = 'notifications' | 'activities'

export const getLoadMoreNotificationsFn = (getActivity: LoadMoreFn, type: NotifActivitiesType) =>
  async (props: LoadMoreProps) => {
    const { darkdot, address, page, size, activityStore = {} as ActivityStore } = props

    if (!address) return []

    const offset = (page - 1) * size

    const activities = await getActivity(address, offset, DEFAULT_PAGE_SIZE) || []

    return loadNotifications({ darkdot, activities , activityStore, type, myAddress: address })
  }

const loadMoreNotifications = getLoadMoreNotificationsFn(getNotifications, 'notifications')
const loadingLabel = 'Loading your notifications...'

export const Notifications = ({ address, title }: BaseActivityProps) => <NotifActivities
  loadMore={loadMoreNotifications}
  address={address}
  title={title}
  loadingLabel={loadingLabel}
  noDataDesc='No notifications for you'
  getCount={getNotificationsCount}
/>

