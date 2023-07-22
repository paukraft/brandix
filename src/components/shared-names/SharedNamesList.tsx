'use client'

import { TimeAgo } from '@/components/TimeAgo'
import { SimpleTooltip } from '@/components/ui/SimpleTooltip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { getTopNamesClient } from '@/lib/client/sharedNamesClient'
import { useInfiniteQuery } from '@tanstack/react-query'
import { map, range } from 'lodash'
import { ArrowBigUpDash, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { Skeleton } from '../ui/skeleton'
import { UpvoteButton } from './upvote-button'

export const SharedNamesList = () => {
  const loadMoreButtonRef = useRef(null)
  const router = useRouter()

  const [upvotedNames, setUpvotedNames] = useLocalStorage<string[]>(
    'upvotedNames',
    []
  )
  const [timespanInDaysString, setTimespanInDays] = useState('0')
  const timespanInDays = parseInt(timespanInDaysString)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['topNames'],
    queryFn: ({ pageParam }) =>
      getTopNamesClient({
        pageParam,
        timespanInDays: timespanInDays || undefined,
      }),
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  })

  useEffect(() => {
    refetch()
  }, [timespanInDays])

  useEffect(() => {
    if (!loadMoreButtonRef.current || !hasNextPage || isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { rootMargin: '250px', threshold: 1 }
    )

    observer.observe(loadMoreButtonRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <ArrowBigUpDash fill="currentColor" className="" size={26} />
          <div className="font-bold leading-tight tracking-tighter">Top</div>
        </div>

        <Select
          value={timespanInDays?.toString()}
          onValueChange={(value) => setTimespanInDays(value)}
        >
          <SelectTrigger className="w-[130px] rounded-full h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="py-1" value="1">
              Today
            </SelectItem>
            <SelectItem className="py-1" value="7">
              This Week
            </SelectItem>
            <SelectItem className="py-1" value="30">
              This Month
            </SelectItem>
            <SelectItem className="py-1" value="365">
              This Year
            </SelectItem>
            <SelectItem className="py-1" value="0">
              All Time
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading &&
          map(range(4), (i) => (
            <Skeleton key={i} className="w-full h-[58px]" />
          ))}

        {data?.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group.data.map((name) => {
              const isUpvoted = upvotedNames.includes(name.name)

              return (
                <div
                  className="group/item flex items-center justify-between px-3 py-2 rounded-lg gap-2 border border-input hover:bg-accent/20 overflow-hidden relative dark:bg-zinc-900/10"
                  key={name.id}
                >
                  <div className="flex flex-col">
                    <Link href={`/shared-names/${name.name}`}>
                      <div className="hover:underline decoration-1">
                        {name.name}
                      </div>
                    </Link>
                    <span className="text-muted-foreground font-light text-xs">
                      Posted <TimeAgo date={new Date(name.createdAt)} />
                    </span>
                  </div>

                  <div className="flex gap-3 items-center">
                    <SimpleTooltip title="Generate Variations">
                      <Link href={`/generate?from=${name.name}`}>
                        <div
                          className="flex md:hidden group-hover/item:flex text-muted-foreground hover:text-black dark:hover:text-white"
                          onClick={() => {}}
                        >
                          <Wand2 size={16} />
                        </div>
                      </Link>
                    </SimpleTooltip>

                    <UpvoteButton
                      name={name.name}
                      votes={name.votes}
                      refetch={refetch}
                    />
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}

        {isFetchingNextPage && isFetching && (
          <div className="flex w-full justify-center mt-4">
            <Spinner />
          </div>
        )}

        {hasNextPage && (
          <div className="flex w-full justify-center mt-4">
            <Button
              onClick={() => fetchNextPage()}
              ref={loadMoreButtonRef}
              size="sm"
            >
              {isFetchingNextPage ? 'Loading more...' : 'Load more'}
            </Button>
          </div>
        )}

        {!isFetchingNextPage && !isLoading && !hasNextPage && (
          <span className="text-muted-foreground text-center text-sm mt-4">
            You looked at{' '}
            {data?.pages.reduce((acc, group) => acc + group.data.length, 0)}{' '}
            names.
            <br />
            Sadly there are no more names to show.
            <br />
            <br />
            Come back later to see if there are new names, or share your own!
          </span>
        )}
      </div>
    </div>
  )
}
