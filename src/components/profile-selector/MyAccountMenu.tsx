import React, { FC, useState } from 'react'
import { Drawer } from 'antd'
import Address from '../profiles/address-views/Name'
import Avatar from '../profiles/address-views/Avatar'
import { AddressProps } from '../profiles/address-views/utils/types'
import { withLoadedOwner, withMyProfile } from '../profiles/address-views/utils/withLoadedOwner'
import { InfoDetails } from '../profiles/address-views'
import dynamic from 'next/dynamic'


type SelectAddressType = AddressProps & {
  onClick?: () => void,
  withShortAddress?: boolean
}

export const SelectAddressPreview: FC<SelectAddressType> = ({
  address,
  owner,
  withShortAddress,
  onClick
}) => (
  <div className='DfChooseAccount' onClick={onClick}>
    <div className='DfAddressIcon d-flex align-items-center'>
      <Avatar address={address} avatar={owner?.content?.avatar} />
    </div>
    <div className='DfAddressInfo ui--AddressComponents'>
      <Address asLink={false} owner={owner} address={address} withShortAddress={withShortAddress} />
      <InfoDetails address={address} />
    </div>
  </div>
)

export const AccountMenu: FC<AddressProps> = ({
  address,
  owner
}) => {
  const MyAccountSection = dynamic(() => import('src/components/profile-selector/MyAccountSection'), { ssr: false })

  const [ visible, setVisible ] = useState(false)

  return <>
    <span className='DfCurrentAddress icon'>
      <SelectAddressPreview address={address} owner={owner} onClick={() => setVisible(true)} />
    </span>
    <Drawer
      placement="right"
      className='DfAccountMenu'
      width={325}
      closable={true}
      onClose={() => setVisible(false)}
      visible={visible || false}
    >
      <MyAccountSection />
    </Drawer>
  </>
}

export const AddressPreviewWithOwner = withLoadedOwner(SelectAddressPreview)
export const MyAccountPopup = withMyProfile(AccountMenu)
