import { ReactQuery } from '@/components/ReactQuery'
import { AccordionText } from '@/components/accordion-text'
import { NameDescription } from '@/components/shared-names/NameDescription'
import { OverallScore } from '@/components/shared-names/OverallScore'
import { Scores } from '@/components/shared-names/Scores'
import { ShareButton } from '@/components/shared-names/ShareButton'
import { SimilarNames } from '@/components/shared-names/SimilarNames'
import { UpvoteWrapper } from '@/components/shared-names/UpvoteWrapper'
import { CircularProgessbar } from '@/components/ui/circular-progessbar'
import { Hr } from '@/components/ui/hr'
import { Skeleton } from '@/components/ui/skeleton'
import { getNameFromDB } from '@/lib/getNameFromDB'
import { cn } from '@/lib/utils'
import { map, range } from 'lodash'
import { ChevronLeft } from 'lucide-react'
import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { PropsWithChildren, Suspense } from 'react'

type Props = { params: { name: string } }

export default function Home({ params }: Props) {
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
            <div className="max-xs:flex-1">
              <Suspense
                fallback={
                  <div className="animate-pulse">
                    <CircularProgessbar value={0} size="small" />
                  </div>
                }
              >
                <OverallScore name={nameParam} />
              </Suspense>
            </div>

            <ShareButton name={nameParam} />

            <div>
              <ReactQuery noDevtools>
                <UpvoteWrapper name={nameParam} styledButton />
              </ReactQuery>
            </div>
          </div>
        </div>

        {/* Description */}
        <AccordionText className="text-slate-500 dark:text-slate-300 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 whitespace-pre-line">
          <Suspense
            fallback={
              <>
                <Skeleton className="w-full" />
                <Skeleton className="w-full md:w-2/3" />
                <div className="md:hidden">
                  <Skeleton className="w-2/3" />
                </div>
              </>
            }
          >
            <NameDescription name={nameParam} />
          </Suspense>
        </AccordionText>
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
        <Suspense fallback={<Skeleton className="w-full h-[34px]" />}>
          <SimilarNames name={nameParam} />
        </Suspense>
      </div>
    </div>
  )
}

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

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const nameParam = decodeURIComponent(params.name)

  const nameFromDB = await getNameFromDB({
    name: nameParam,
    generate: [],
  })

  const title = `${nameFromDB.name} - Analyzed Brand Name | Brandix`
  const description = `Check out the brand name analysis of "${nameFromDB.name}" on Brandix. It has a score of ${nameFromDB.score} and is described as: ${nameFromDB.description}.`

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
    },
    twitter: {
      title: title,
      description: description,
    },
  }
}
