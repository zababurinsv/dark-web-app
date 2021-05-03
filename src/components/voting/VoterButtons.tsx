import React, { useState } from 'react';
import { LikeTwoTone, LikeOutlined, DislikeTwoTone, DislikeOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { Product, Reaction } from '@darkpay/dark-types/substrate/interfaces/darkdot';
import { ReactionKind } from '@darkpay/dark-types/substrate/classes';
import { newLogger } from '@darkpay/dark-utils';
import useDarkdotEffect from '../api/useDarkdotEffect';
import { useMyAddress } from '../auth/MyAccountContext';
import { BareProps } from '../utils/types';
import { IconWithLabel } from '../utils';
import { useResponsiveSize } from '../responsive';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const log = newLogger('VoterButtons')

type VoterProps = BareProps & {
  product: Product,
  preview?: boolean
}

type ReactionType = 'Upvote' | 'Downvote'

type VoterButtonProps = VoterProps & {
  reactionType: ReactionType,
  reaction?: Reaction,
  onSuccess?: () => void,
  preview?: boolean
};

const VoterButton = ({
  reactionType,
  reaction,
  product: { id, upvotes_count, downvotes_count },
  className,
  style,
  onSuccess,
  preview
}: VoterButtonProps) => {

  const { isMobile } = useResponsiveSize()
  const kind = reaction ? reaction && reaction.kind.toString() : 'None'
  const isUpvote = reactionType === 'Upvote'
  const count = isUpvote ? upvotes_count : downvotes_count

  const buildTxParams = () => {
    if (reaction === undefined) {
      return [ id, new ReactionKind(reactionType) ];
    } else if (kind !== reactionType) {
      return [ id, reaction.id, new ReactionKind(reactionType) ];
    } else {
      return [ id, reaction.id ];
    }
  };

  const isActive = kind === reactionType
  const color = isUpvote ? '#00a500' : '#ff0000'

  const changeReactionTx = kind !== reactionType
    ? `reactions.updateProductReaction`
    : `reactions.deleteProductReaction`

  let icon: JSX.Element
  if (isUpvote) {
    icon = isActive
      ? <LikeTwoTone twoToneColor={color} />
      : <LikeOutlined />
  } else {
    icon = isActive
      ? <DislikeTwoTone twoToneColor={color} />
      : <DislikeOutlined />
  }

  return <TxButton
    className={`DfVoterButton ${className}`}
    style={{
      color: isActive ? color : '',
      ...style
    }}
    tx={!reaction
      ? `reactions.createProductReaction`
      : changeReactionTx
    }
    params={buildTxParams()}
    onSuccess={onSuccess}
    title={preview ? reactionType : undefined}
  >
    <IconWithLabel
      icon={icon}
      count={count}
      label={(preview || isMobile) ? undefined : reactionType}
    />
  </TxButton>
}

type VoterButtonsProps = VoterProps & {
  only?: 'Upvote' | 'Downvote',
}
export const VoterButtons = (props: VoterButtonsProps) => {
  const { product, only } = props
  const [ reactionState, setReactionState ] = useState<Reaction>();
  const address = useMyAddress();
  const [ reloadTrigger, setReloadTrigger ] = useState(true);

  useDarkdotEffect(({ substrate }) => {
    let isSubscribe = true;

    async function reloadReaction () {
      if (!address) return

      const reactionId = await substrate.getProductReactionIdByAccount(address, product.id)
      const reaction = await substrate.findReaction(reactionId)
      if (isSubscribe) {
        setReactionState(reaction);
      }
    }

    reloadReaction().catch(err =>
      log.error(`Failed to load a reaction. ${err}`));

    return () => { isSubscribe = false; };
  }, [ reloadTrigger, address, product ]);

  const renderVoterButton = (reactionType: ReactionType) => <VoterButton
    reaction={reactionState}
    reactionType={reactionType}
    onSuccess={() => setReloadTrigger(!reloadTrigger)}
    {...props}
  />

  const UpvoteButton = () => only !== 'Downvote' ? renderVoterButton('Upvote') : null
  const DownvoteButton = () => only !== 'Upvote' ? renderVoterButton('Downvote') : null

  return <>
    <UpvoteButton />
    <DownvoteButton />
  </>

};

export const UpvoteVoterButton = (props: VoterProps) => <VoterButtons only={'Upvote'} {...props} />
export const DownvoteVoterButton = (props: VoterProps) => <VoterButtons only={'Downvote'} {...props} />
