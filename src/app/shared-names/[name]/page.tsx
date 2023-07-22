import { ReactQuery } from '@/components/ReactQuery'
import { NameDescription } from '@/components/shared-names/NameDescription'
import { OverallScore } from '@/components/shared-names/OverallScore'
import { Scores } from '@/components/shared-names/Scores'
import { ShareButton } from '@/components/shared-names/ShareButton'
import { SimilarNames } from '@/components/shared-names/SimilarNames'
import { UpvoteWrapper } from '@/components/shared-names/UpvoteWrapper'
import { CircularProgessbar } from '@/components/ui/circular-progessbar'
import { Hr } from '@/components/ui/hr'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { map, range } from 'lodash'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PropsWithChildren, Suspense } from 'react'

export const Card = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={cn(
        'p-6 rounded-lg gap-2 border border-input dark:bg-zinc-900/10 flex flex-col w-fit',
        className
      )}
    >
      {children}
    </div>
  )
}

export default function Home({ params }: { params: { name: string } }) {
  const nameParam = decodeURIComponent(params.name)

  return (
    <div className="container mx-auto flex flex-col px-4 gap-1">
      <div className="flex flex-col gap-3 md:gap-2 pt-8 md:pt-12">
        {/* Header */}
        <div className="flex gap-3 xs:items-center max-xs:flex-col">
          <div className="flex gap-3 items-center">
            <Link href="/shared-names">
              <button className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
                <ChevronLeft className="h-5 w-5 shrink-0 opacity-80" />
              </button>
            </Link>

            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
              {nameParam}
            </h1>
          </div>

          <div className="flex-1 flex xs:justify-end gap-3 items-center">
            <Suspense
              fallback={
                <div className="animate-pulse">
                  <CircularProgessbar value={0} size="small" />
                </div>
              }
            >
              <OverallScore name={nameParam} />
            </Suspense>

            <ShareButton name={nameParam} />

            <div>
              <ReactQuery noDevtools>
                <UpvoteWrapper name={nameParam} styledButton />
              </ReactQuery>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-slate-500 dark:text-slate-300 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <Suspense
            fallback={
              <>
                <Skeleton className="w-full" />
                <div className="md:hidden">
                  <Skeleton className="w-2/3" />
                </div>
              </>
            }
          >
            <NameDescription name={nameParam} />
          </Suspense>
        </div>
      </div>

      <Hr />

      {/* Scores */}
      <Suspense
        fallback={
          <div className="flex flex-col gap-6">
            {map(range(7), (i) => (
              <Skeleton key={i} className="w-full h-[48px]" />
            ))}
          </div>
        }
      >
        <Scores name={nameParam} />
      </Suspense>

      {/* Similar Names */}
      <div className="mt-10 flex flex-col gap-2">
        <span className="text-xl font-bold leading-tight tracking-tighter">
          Similar names:
        </span>
        <Suspense
          fallback={
            <div className="grid grid-cols-5 gap-4">
              {map(range(1), (i) => (
                <Skeleton key={i} className="w-full h-[48px]" />
              ))}
            </div>
          }
        >
          <SimilarNames name={nameParam} />
        </Suspense>
      </div>
    </div>
  )
}
