import { Option } from '@polkadot/types/codec'
import { AccountId } from '@polkadot/types/interfaces/runtime'
import { bool } from '@polkadot/types/primitive'
import { EntityId } from '@reduxjs/toolkit'
import { AnyAccountId, CommonContent } from '@subsocial/types'
import { Content, Post, SocialAccount, Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces'
import { notEmptyObj } from '@subsocial/utils'
import BN from 'bn.js'
import { EntityData } from './dto'

type Id = string

type Cid = string

export type HasId = {
  id: Id
}

type CanHaveParentId = {
  parentId?: Id
}

type CanHaveSpaceId = {
  spaceId?: Id
}

type CanHaveContent = {
  contentId?: Cid
}

type HasOwner = {
  ownerId: string
}

type CanHaveHandle = {
  handle?: string
}

type HasCreated = {
  createdByAccount: string
  createdAtBlock: number
  createdAtTime: number
}

type CanBeUpdated = {
  isUpdated: boolean
  updatedByAccount?: string
  updatedAtBlock?: number
  updatedAtTime?: number
}

type CanBeHidden = {
  hidden: boolean // TODO rename to 'isHidden'?
  // isPublic: boolean
}

export type FlatSuperCommon =
  HasCreated &
  CanBeUpdated &
  CanHaveContent

type FlatSpaceOrPost =
  FlatSuperCommon &
  HasId &
  HasOwner &
  CanBeHidden

/** Flat space struct. */
export type SpaceStruct = FlatSpaceOrPost & CanHaveParentId & CanHaveHandle & {
  totalPostsCount: number
  hiddenPostsCount: number
  visiblePostsCount: number

  followersCount: number
  score: number
  // permissions?: SpacePermissions
}

/** Flat post struct. */
export type PostStruct = FlatSpaceOrPost & CanHaveSpaceId & {
  totalRepliesCount: number
  hiddenRepliesCount: number
  visibleRepliesCount: number

  sharesCount: number
  upvotesCount: number
  downvotesCount: number
  score: number

  isRegularPost: boolean
  isSharedPost: boolean
  isComment: boolean
}

type CommentExtension = {
  parentId?: Id
  rootPostId: Id
}

type SharedPostExtension = {
  sharedPostId: Id
}

type FlatPostExtension = {} | CommentExtension | SharedPostExtension

export type SharedPostStruct = PostStruct & SharedPostExtension

export type CommentStruct = PostStruct & CommentExtension

type SocialAccountStruct = HasId & {
  followersCount: number
  followingAccountsCount: number
  followingSpacesCount: number
  reputation: number
  hasProfile: boolean
}

/** Flat account profile struct. */
export type ProfileStruct = SocialAccountStruct & Partial<FlatSuperCommon>

type SuperCommonStruct = {
  created: WhoAndWhen
  updated: Option<WhoAndWhen>
  content: Content
}

type SpaceOrPostStruct = SuperCommonStruct & {
  id: BN
  owner: AccountId
  hidden: bool
}

export type SocialAccountWithId = {
  id: AnyAccountId
  struct: SocialAccount
}

type EntityDataWithField<S extends {}> = EntityData<HasId & S, CommonContent> | (HasId & S)

export function getUniqueIds<S extends {}> (structs: EntityDataWithField<S>[], idFieldName: keyof S): EntityId[] {
  type _EntityData = EntityData<S & HasId, CommonContent>
  const ids = new Set<EntityId>()
  structs.forEach((x) => {
    const edStruct = (x as _EntityData).struct
    const struct = notEmptyObj(edStruct) ? edStruct : x as S
    const id = struct[idFieldName] as unknown as EntityId
    if (id && !ids.has(id)) {
      ids.add(id)
    }
  })
  return Array.from(ids)
}

export const getUniqueOwnerIds = (entities: EntityDataWithField<HasOwner>[]) =>
  getUniqueIds(entities, 'ownerId')

export const getUniqueContentIds = (entities: EntityDataWithField<CanHaveContent>[]) =>
  getUniqueIds(entities, 'contentId')

export const getUniqueSpaceIds = (entities: EntityDataWithField<CanHaveSpaceId>[]) =>
  getUniqueIds(entities, 'spaceId')

function getUpdatedFields ({ updated }: SuperCommonStruct): CanBeUpdated {
  const maybeUpdated = updated.unwrapOr(undefined)
  let res: CanBeUpdated = {
    isUpdated: updated.isSome,
  }
  if (maybeUpdated) {
    res = {
      ...res,
      updatedByAccount: maybeUpdated.account.toString(),
      updatedAtBlock: maybeUpdated.block.toNumber(),
      updatedAtTime: maybeUpdated.time.toNumber(),
    }
  }
  return res
}

function getContentFields ({ content }: SuperCommonStruct): CanHaveContent {
  let res: CanHaveContent = {}
  if (content.isIpfs) {
    res = {
      contentId: content.asIpfs.toString()
    }
  }
  return res
}

function flattenCommonFields (struct: SuperCommonStruct): FlatSuperCommon {
  const { created } = struct

  return {
    // created:
    createdByAccount: created.account.toString(),
    createdAtBlock: created.block.toNumber(),
    createdAtTime: created.time.toNumber(),

    ...getUpdatedFields(struct),
    ...getContentFields(struct),
  }
}

function flattenSpaceOrPostStruct (struct: SpaceOrPostStruct): FlatSpaceOrPost {
  return {
    ...flattenCommonFields(struct),
    id: struct.id.toString(),
    ownerId: struct.owner.toString(),
    hidden: struct.hidden.isTrue,
  }
}

export function flattenSpaceStruct (struct: Space): SpaceStruct {
  const totalPostsCount = struct.posts_count.toNumber()
  const hiddenPostsCount = struct.hidden_posts_count.toNumber()
  const visiblePostsCount = totalPostsCount - hiddenPostsCount

  let parentField: CanHaveParentId = {}
  if (struct.parent_id.isSome) {
    parentField = {
      parentId: struct.parent_id.unwrap().toString()
    }
  }

  let handleField: CanHaveHandle = {}
  if (struct.handle.isSome) {
    handleField = {
      handle: struct.handle.unwrap().toString()
    }
  }

  return {
    ...flattenSpaceOrPostStruct(struct),
    ...parentField,
    ...handleField,

    totalPostsCount,
    hiddenPostsCount,
    visiblePostsCount,
    followersCount: struct.followers_count.toNumber(),
    score: struct.score.toNumber()
  }
}

export function flattenSpaceStructs (structs: Space[]): SpaceStruct[] {
  return structs.map(flattenSpaceStruct)
}

function flattenPostExtension (struct: Post): FlatPostExtension {
  const { isSharedPost, isComment } = struct.extension
  let normExt: FlatPostExtension = {}

  if (isSharedPost) {
    const sharedPost: SharedPostExtension = {
      sharedPostId: struct.extension.asSharedPost.toString()
    }
    normExt = sharedPost
  } else if (isComment) {
    const { parent_id, root_post_id } = struct.extension.asComment
    const comment: CommentExtension = {
      rootPostId: root_post_id.toString()
    }
    if (parent_id.isSome) {
      comment.parentId = parent_id.unwrap().toString()
    }
    normExt = comment
  }

  return normExt
}

export function flattenPostStruct (struct: Post): PostStruct {
  const totalRepliesCount = struct.replies_count.toNumber()
  const hiddenRepliesCount = struct.hidden_replies_count.toNumber()
  const visibleRepliesCount = totalRepliesCount - hiddenRepliesCount
  const { isRegularPost, isSharedPost, isComment } = struct.extension
  const extensionFields = flattenPostExtension(struct)
  
  let spaceField: CanHaveSpaceId = {}
  if (struct.space_id.isSome) {
    spaceField = {
      spaceId: struct.space_id.unwrap().toString(),
    }
  }

  return {
    ...flattenSpaceOrPostStruct(struct),
    ...spaceField,
    ...extensionFields,

    totalRepliesCount,
    hiddenRepliesCount,
    visibleRepliesCount,

    sharesCount: struct.shares_count.toNumber(),
    upvotesCount: struct.upvotes_count.toNumber(),
    downvotesCount: struct.downvotes_count.toNumber(),
    score: struct.score.toNumber(),

    isRegularPost,
    isSharedPost,
    isComment,
  }
}

export function flattenPostStructs (structs: Post[]): PostStruct[] {
  return structs.map(flattenPostStruct)
}

export function asSharedPostStruct (post: PostStruct): SharedPostStruct {
  if (!post.isSharedPost) throw new Error('Not a shared post')

  return post as SharedPostStruct
}

export function asCommentStruct (post: PostStruct): CommentStruct {
  if (!post.isComment) throw new Error('Not a comment')

  return post as CommentStruct
}

export function flattenProfileStruct (account: AnyAccountId, struct: SocialAccount): ProfileStruct {
  const profile = struct.profile.unwrapOr(undefined)
  const hasProfile = struct.profile.isSome
  const maybeProfile: Partial<FlatSuperCommon> = profile
    ? flattenCommonFields(profile)
    : {}

  return {
    id: account.toString(),

    followersCount: struct.followers_count.toNumber(),
    followingAccountsCount: struct.following_accounts_count.toNumber(),
    followingSpacesCount: struct.following_spaces_count.toNumber(),
    reputation: struct.reputation.toNumber(),

    hasProfile,
    ...maybeProfile
  }
}

export function flattenProfileStructs (accounts: SocialAccountWithId[]): ProfileStruct[] {
  return accounts.map(({ id, struct }) => flattenProfileStruct(id, struct))
}
