import React from 'react'
import { AnyAccountId } from '@darkpay/dark-types/substrate'
import { ProfileData } from '@darkpay/dark-types'

export type AddressProps = {
  className?: string
  style?: React.CSSProperties
  address: AnyAccountId,
  owner?: ProfileData
}

export type ExtendedAddressProps = AddressProps & {
  children?: React.ReactNode,
  afterName?: JSX.Element
  details?: JSX.Element
  isPadded?: boolean,
  isShort?: boolean,
  size?: number,
  withFollowButton?: boolean,
};
