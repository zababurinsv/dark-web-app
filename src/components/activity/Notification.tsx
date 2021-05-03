import React from 'react';
import { DfBgImageLink } from '../utils/DfBgImg';
import { nonEmptyStr } from '@darkpay/dark-utils';
import Avatar from '../profiles/address-views/Avatar'
import Name from '../profiles/address-views/Name';
import { MutedDiv } from '../utils/MutedText';
import { NotificationType } from './NotificationUtils';
import Link from 'next/link'

export function Notification (props: NotificationType) {
  const { address, notificationMessage, details, image = '', owner, links } = props
  const avatar = owner?.content?.avatar

  return <Link {...links}>
    <a className='DfNotificationItem'>
      <Avatar address={address} avatar={avatar} />
      <div className='d-flex justify-content-between w-100'>
        <div className="DfNotificationContent">
          <div className="d-flex flex-wrap">
            <Name owner={owner} address={address}/>
            {notificationMessage}
          </div>
          <MutedDiv className='DfDate'>{details}</MutedDiv>
        </div>
      </div>
      {nonEmptyStr(image) && <DfBgImageLink {...links} src={image} size={80} className='mb-2' />}
    </a>
  </Link>
}

export default Notification
