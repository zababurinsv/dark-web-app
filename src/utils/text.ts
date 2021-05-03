import { isEmptyStr } from '@darkpay/dark-utils'
import truncate from 'lodash.truncate'

const DEFAULT_SUMMARY_LEN = 300

const SEPARATOR = /[.,:;!?()[\]{}\s]+/

/** Shorten a plain text up to `limit` chars. Split by separators. */
export const summarize = (
  text: string,
  limit: number = DEFAULT_SUMMARY_LEN
): string => {
  if (isEmptyStr(text)) return ''

  text = (text as string).trim()

  return text.length <= limit
    ? text
    : truncate(text, {
      length: limit,
      separator: SEPARATOR
    })
}
