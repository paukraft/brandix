import AppScreenshotDesktop from '@/assets/app-screenshot-desktop.png'
import AppScreenshotMobile from '@/assets/app-screenshot-mobile.png'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col gap-0 md:gap-16 xl:gap-24">
      {/* Hero */}
      <div className="px-4 container mx-auto flex items-center flex-col md:mt-12 xl:mt-16 gap-6">
        <Link href="/generate">
          <Button variant="outline" className="rounded-full group/generate">
            Use for free
            <ArrowRight className="ml-2 w-4 group-hover/generate:translate-x-1 duration-100" />
          </Button>
        </Link>

        <div className="relative text-7xl font-bold text-center max-w-4xl leading-[1.1]">
          <div className="absolute blur-xl opacity-30 pointer-events-none">
            Generate Brand names in seconds <span className="">using AI</span>
          </div>
          <div className="">
            Generate Brand names in seconds <span className="">using AI</span>
          </div>
        </div>

        <div className="text-3xl max-w-5xl text-center text-gray-400">
          Have an Idea? We generate the perfect Brand name for you. As an bonus
          we also instantly check the domain availability for you.
        </div>
      </div>

      <div className="relative isolate">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mt-12 flow-root sm:mt-20">
            <div className="-m-2 rounded-xl dark:bg-gray-100/5 bg-gray-900/5 p-2 ring-1 ring-inset dark:ring-gray-100/10 ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src={AppScreenshotDesktop}
                alt="App screenshot"
                width="2811"
                height="4944"
                className="rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 max-md:hidden"
              />
              <Image
                src={AppScreenshotMobile}
                alt="App screenshot"
                width="1170"
                height="2532"
                className="rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 md:hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col items-center gap-4 text-center mt-20">
        <span className="text-4xl font-bold">
          Need help coming up with a Brand name?
        </span>
        <span className="text-gray-400 max-w-lg mx-auto">
          No problem! With our simple to use AI you can generate Brand names in
          literally seconds.
        </span>
      </div> */}

      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-20 md:mt-20 xl:mt-36">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
          <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <dt className="text-base leading-7 text-gray-400">
              Generations every 24 hours
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
              0 million
            </dd>
          </div>
          <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <dt className="text-base leading-7 text-gray-400">
              Favorites saved
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
              0 thousand
            </dd>
          </div>
          <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <dt className="text-base leading-7 text-gray-400">Total Users</dt>
            <dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
              0
            </dd>
          </div>
        </dl>
      </div>

      <div className="mb-14" />
    </div>
  )
}
