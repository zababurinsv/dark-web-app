import React, { useState } from 'react';
import { AddressProps } from './utils/types'
import Avatar from './Avatar';
import { nonEmptyStr } from '@darkpay/dark-utils';
import { Pluralize } from 'src/components/utils/Plularize';
import NameDetails from './utils/NameDetails';
import { AccountFollowersModal, AccountFollowingModal } from '../AccountsListModal';
import { ProfileContent, ProfileData } from '@darkpay/dark-types';
import { withLoadedOwner, withMyProfile } from './utils/withLoadedOwner';
import { SummarizeMd } from 'src/components/utils/md';
import ViewProfileLink from '../ViewProfileLink';
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config';
import { EditProfileLink } from './utils'

type ProfilePreviewProps = AddressProps & {
  mini?: boolean,
  withAbout?: boolean,
  withLabel?: boolean,
  size?: number
}

export const ProfilePreview: React.FunctionComponent<ProfilePreviewProps> = ({ address, withLabel, className, withAbout = false, owner = {} as ProfileData, size, mini = false }) => { // TODO fix CSS style
  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const { struct, content = {} as ProfileContent } = owner;
  const { about, avatar } = content
  const accountForUrl = { address }

  const followers = struct ? struct.followers_count.toString() : '0';
  const following = struct ? struct.following_accounts_count.toString() : '0';

  const openFollowersModal = () => {
    if (!followers) return;

    setFollowersOpen(true);
  };

  const openFollowingModal = () => {
    if (!following) return;

    setFollowingOpen(true);
  };

  return <div className={`ProfileDetails d-flex ${className}`}>
    <Avatar size={size || LARGE_AVATAR_SIZE} address={address} avatar={avatar} />
    <div className='ml-2'>
      <NameDetails owner={owner} address={address} withLabel={withLabel} />
      {!mini && <>
        {withAbout && nonEmptyStr(about) &&
          <div className='DfPopup-about'>
            <SummarizeMd md={about} more={<ViewProfileLink account={accountForUrl} title={'See More'} />} />
          </div>
        }
        <div className='DfPopup-links'>
          <div onClick={openFollowersModal} className={`DfPopup-link ${followers ? '' : 'disable'}`}>
            <Pluralize count={followers} singularText='Follower'/>
          </div>
          <div onClick={openFollowingModal} className={`DfPopup-link ${following ? '' : 'disable'}`}>
            <Pluralize count={following} singularText='Following'/>
          </div>
        </div>
        {followersOpen && <AccountFollowersModal id={address} followersCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers} singularText='Follower' />} />}
        {followingOpen && <AccountFollowingModal id={address} followingCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={<Pluralize count={following} singularText='Following' />} />}
        <EditProfileLink address={address} className='DfGreyLink FontNormal mb-2' />
      </>}
    </div>
  </div>
}

export const ProfilePreviewWithOwner = withLoadedOwner(ProfilePreview)

export default ProfilePreviewWithOwner

export const MyProfilePreview = withMyProfile(ProfilePreview)
