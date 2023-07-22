import { ReactQuery } from '@/components/ReactQuery'
import { SharedNamesList } from '@/components/shared-names/SharedNamesList'

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col px-4">
      <div className="flex flex-col gap-0 md:gap-2 pt-8 md:pt-12 pb-4 md:pb-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
          Brandix community
        </h1>
        <span className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
          This is a list of names that have been shared by the community.
        </span>
      </div>

      <ReactQuery>
        <SharedNamesList />
      </ReactQuery>
    </div>
  )
}
