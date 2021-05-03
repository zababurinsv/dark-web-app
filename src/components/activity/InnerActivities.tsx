import { InnerActivitiesProps } from "./types"
import { useDarkdotApi } from "../utils/DarkdotApiContext"
import { useState, useEffect, useCallback } from "react"
import { notDef } from "@darkpay/dark-utils"
import { InfiniteListByPage } from "../lists/InfiniteList"
import { Loading } from "../utils"

export function InnerActivities<T> ({ address, title, getCount, totalCount, noDataDesc, loadingLabel, loadMore, ...otherProps }: InnerActivitiesProps<T>) {
  const { darkdot, isApiReady } = useDarkdotApi()
  const [ total, setTotalCount ] = useState<number | undefined>(totalCount)

  useEffect(() => {
    if (!address || !getCount) return

    getCount
      ? getCount(address).then(setTotalCount)
      : setTotalCount(0)
  }, [ address ])

  const noData = notDef(total)

  const Activities = useCallback(() => <InfiniteListByPage
    {...otherProps}
    loadMore={(page, size) => loadMore({ darkdot, address, page, size})}
    loadingLabel={loadingLabel}
    title={title ? `${title} (${total})` : null}
    noDataDesc={noDataDesc}
    totalCount={total || 0}

  />, [ isApiReady, noData, total ])

  if (!isApiReady || noData) return <Loading label={loadingLabel} />

  return <Activities />
}
