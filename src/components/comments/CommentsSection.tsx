import React, { FC } from 'react'
import { ViewComment } from './ViewComment'
import { NewComment } from './CreateComment'
import { mdToText } from 'src/utils'
import { PostWithSomeDetails, PostData } from 'src/types'
import { NextPage } from 'next'
import { getProfileName } from '../substrate'
import { Pluralize } from '../utils/Plularize'
import ViewPostLink from '../posts/ViewPostLink'
import { CommentsTree } from './CommentTree'
import Section from '../utils/Section'
import { PageContent } from '../main/PageWrapper'
import { postUrl } from '../urls'
import { SpaceStruct } from 'src/types'

type CommentSectionProps = {
  space: SpaceStruct,
  post: PostWithSomeDetails,
  replies?: PostWithSomeDetails[],
  hashId?: string,
  withBorder?: boolean
}

export const CommentSection: FC<CommentSectionProps> = React.memo(({ post, hashId, space, replies = [], withBorder }) => {
  const { post: { struct } } = post
  const { repliesCount } = struct

  return <Section id={hashId} className={`DfCommentSection ${withBorder && 'TopBorder'}`}>
    <h3><Pluralize count={repliesCount} singularText='comment' /></h3>
    <NewComment post={struct} asStub />
    <CommentsTree rootPost={struct} parent={struct} space={space} replies={replies} />
  </Section>
})

type CommentPageProps = {
  comment: PostWithSomeDetails,
  parentPost: PostData,
  space: SpaceStruct,
  replies: PostWithSomeDetails[]
}

export const CommentPage: NextPage<CommentPageProps> = ({ comment, parentPost, replies, space }) => {
  const { post: { struct, content }, owner } = comment
  const { content: postContent } = parentPost
  const address = struct.ownerId
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => <>
    In response to{' '}
    <ViewPostLink space={space} post={parentPost} title={postContent?.title} />
  </>

  const meta = {
    title: `${profileName} commented on ${content?.title}`,
    desc: mdToText(content?.body),
    canonical: postUrl(space, comment.post),
  }

  return (
    <PageContent meta={meta} className='DfContentPage DfEntirePost'>
      {renderResponseTitle()}
      <ViewComment space={space} comment={comment} replies={replies} withShowReplies />
    </PageContent>
  )
}
