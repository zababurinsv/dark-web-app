import React from 'react';
import Head from 'next/head';
import { isEmptyStr, nonEmptyStr, nonEmptyArr } from '@darkpay/dark-utils';
import { summarize } from 'src/utils';
import { resolveIpfsUrl } from 'src/ipfs';

type HeadMetaProps = {
  title: string,
  desc?: string,
  image?: string,
  canonical?: string,
  tags?: string[]
}

// Google typically displays the first 50–60 characters of a title tag.
// If you keep your titles under 60 characters, our research suggests
// that you can expect about 90% of your titles to display properly.
const MAX_TITLE_LEN = 45
const MAX_DESC_LEN = 300

const SITE_NAME = 'Darkdot Network'

const DEFAULT_TITLE = 'Darkdot - social network on Polkadot & IPFS'

const DEFAULT_DESC =
  'Darkdot is a Polkadot ecosystem project supported by Web3 Foundation. ' +
  'Darkdot follows SoFi (social finance) principles to bring DeFi features to social networking.'

export const createTitle = (title: string) => {
  if (isEmptyStr(title)) {
    return DEFAULT_TITLE
  }

  const leftPart = summarize(title, MAX_TITLE_LEN)
  return `${leftPart} - Darkdot`
}

const DEFAULT_SUBSOCIAL_IMG = '/darkdot-sign.png'

export function HeadMeta (props: HeadMetaProps) {
  const { title, desc = DEFAULT_DESC, image, canonical, tags } = props
  const summary = summarize(desc, MAX_DESC_LEN)
  const img = nonEmptyStr(image) ? resolveIpfsUrl(image) : DEFAULT_SUBSOCIAL_IMG

  return <div>
    <Head>
      <title>{createTitle(title)}</title>
      <meta name='description' content={summary} />
      {nonEmptyArr(tags) && <meta name='keywords' content={tags?.join(', ')} />}
      {nonEmptyStr(canonical) && <link rel='canonical' href={canonical} />}

      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:image' content={img} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={summary} />

      <meta name='twitter:card' content='summary' />
      <meta name='twitter:site' content={SITE_NAME} />
      <meta name='twitter:image' content={img} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={summary} />
    </Head>
  </div>
}

export default HeadMeta
