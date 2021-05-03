import React, { } from 'react'
import { Menu, Badge } from 'antd'
import Router, { useRouter } from 'next/router'
import { useIsSignedIn, useMyAddress } from '../components/auth/MyAccountContext'
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext'
import Link from 'next/link'
import { newLogger } from '@darkpay/dark-utils'
// import { useNotifCounter } from '../components/utils/NotifCounter'
import { buildAuthorizedMenu, DefaultMenu, isDivider, PageLink } from './SideMenuItems'
import { OnBoardingCard } from 'src/components/onboarding'
import { useAuth } from 'src/components/auth/AuthContext'
import { useResponsiveSize } from 'src/components/responsive'

const log = newLogger(SideMenu.name)

const goToPage = ([ url, as ]: string[]) => {
  Router.push(url, as).catch(err =>
    log.error(`Failed to navigate to a selected page. ${err}`)
  )
}

const renderPageLink = (item: PageLink, unreadCount?: number) => {
  const { icon } = item

  if (item.hidden) {
    return null
  }

  return item.isAdvanced
    ? (
      <Menu.Item key={item.page[0]} >
        <a href={item.page[0]} rel='noreferrer' target='_blank'>
          {icon}
          <span>{item.name}</span>
        </a>
      </Menu.Item>
    ) : (
      <Menu.Item key={item.page[1] || item.page[0]} onClick={() => goToPage(item.page)}>
        <Link href={item.page[0]} as={item.page[1]}>
          <a>
            {icon}
            <span className='MenuItemName'>{item.name}</span>
            {item.isNotifications && renderNotificationsBadge(unreadCount)}
          </a>
        </Link>
      </Menu.Item>
    )
}

const renderNotificationsBadge = (unreadCount?: number) => {
  if (!unreadCount || unreadCount <= 0) return null

  return <Badge count={unreadCount} className="site-badge-count-4" />
}

function SideMenu () {
  const { state: { collapsed } } = useSidebarCollapsed()
  const { asPath } = useRouter()
  const myAddress = useMyAddress()
  const isLoggedIn = useIsSignedIn()
  // const { unreadCount } = useNotifCounter()
  const { state: { showOnBoarding } } = useAuth()
  const { isNotMobile } = useResponsiveSize()

  const menuItems = isLoggedIn && myAddress
    ? buildAuthorizedMenu(myAddress)
    : DefaultMenu

  return (
    <Menu
      selectedKeys={[ asPath ]}
      mode='inline'
      theme='light'
      style={{ height: '100%', borderRight: 0 }}
    >
      {menuItems.map((item, i) => isDivider(item)
        ? <Menu.Divider key={`divider-${i}`} />
        : renderPageLink(item/* , unreadCount */)
      )}
      {isNotMobile && showOnBoarding && !collapsed && <OnBoardingCard />}
      {isLoggedIn && <Menu.Divider />}
      {/* {isLoggedIn && <MySubscriptions />} */}
    </Menu>
  )
}

export default SideMenu
