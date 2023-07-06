import AppScreenshotDesktopDark from '@/assets/app-screenshot-desktop-dark.png'
import AppScreenshotDesktopLight from '@/assets/app-screenshot-desktop-light.png'
import AppScreenshotMobileDark from '@/assets/app-screenshot-mobile-dark.png'
import AppScreenshotMobileLight from '@/assets/app-screenshot-mobile-light.png'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { BrainCog, Check, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col gap-4 md:gap-16 xl:gap-24">
      {/* Hero */}
      <div className="px-4 container mx-auto flex items-center flex-col mt-6 md:mt-12 xl:mt-16 gap-6">
        <Link href="/generate">
          <Button
            variant="outline"
            className="rounded-full group/generate font-light py-1.5 h-auto px-2 dark:text-slate-100 dark:border-slate-600"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            New: Our AI is completly free to use
            {/* <ArrowRight className="ml-2 w-4 group-hover/generate:translate-x-1 duration-100" /> */}
          </Button>
        </Link>

        <div className="relative text-4xl md:text-7xl font-bold text-center max-w-4xl leading-[1.1]">
          <div className="absolute blur-xl opacity-30 pointer-events-none">
            Generate Brand names in seconds <span className="">using AI</span>
          </div>
          <div className="">
            Generate Brand names in seconds <span className="">using AI</span>
          </div>
        </div>

        <div className="text-lg md:text-2xl max-w-5xl text-center text-gray-500 dark:text-gray-400">
          Have an Idea? We generate the perfect Brand name for you. As an bonus
          we also instantly check the domain availability for you.
        </div>
      </div>

      <div className="container mx-auto flex flex-col items-center max-md:mt-10">
        <Link href="/generate" className="relative">
          <div className="absolute top-0 blur-md h-full w-full inset-0 bg-gradient-to-r from-slate-600 to-indigo-500 group-hover:-inset-0.5 duration-100" />
          <Button size="lg" variant="default" className="text-lg relative">
            Start generating
          </Button>
        </Link>
      </div>

      {/* <div className="container mx-auto flex flex-col items-center max-md:mt-10">
        <Link href="/generate" className="relative group">
          <div className="absolute top-0 blur-md h-full w-full inset-0 bg-gradient-to-r from-orange-500 via-red-600 to-indigo-500 group-hover:-inset-0.5 duration-100" />
          <div className="relative px-5 py-4 text-xl rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium flex items-center duration-100">
            Start Generating
          </div>
        </Link>
      </div> */}

      <div className="relative isolate -mb-80 sm:-mb-96 md:-mb-56 -z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mt-10 flow-root sm:mt-12">
            <div className="-m-2 rounded-xl dark:bg-gray-100/5 bg-gray-900/5 p-2 ring-1 ring-inset dark:ring-gray-100/5 ring-gray-900/5 lg:-m-4 lg:rounded-2xl lg:p-3">
              <Image
                src={AppScreenshotDesktopDark}
                alt="Dark theme desktop version of our AI brand name generator"
                width="2811"
                height="4944"
                className="hidden md:dark:block rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 max-md:hidden"
              />
              <Image
                src={AppScreenshotMobileDark}
                alt="Dark theme mobile version of our AI brand name generator"
                width="1170"
                height="2532"
                className="hidden max-md:dark:block rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 md:hidden"
              />
              <Image
                src={AppScreenshotDesktopLight}
                alt="Light theme desktop version of our AI brand name generator"
                width="2811"
                height="4944"
                className="dark:hidden rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 max-md:hidden"
              />
              <Image
                src={AppScreenshotMobileLight}
                alt="Light theme mobile version of our AI brand name generator"
                width="1170"
                height="2532"
                className="dark:hidden rounded-md shadow-2xl ring-1 dark:ring-gray-100/10 ring-gray-900/10 md:hidden"
              />
            </div>
          </div>
        </div>
        <div className="translate-y-12 h-full w-full absolute bottom-0 bg-gradient-to-b from-transparent to-white to-70% dark:to-slate-950" />
      </div>

      <div className="container mx-auto flex flex-col gap-6 md:gap-12">
        {/* <TextBlock
          title="Need help coming up with a Brand name?"
          description="No problem! With our simple to use AI you can generate Brand names in literally seconds."
          className="mt-20"
        /> */}

        <TextBlock
          title="How does it work?"
          description="You can choose from a variety of categories or write a message and we will generate brand names for you.."
          className="mt-20 text-center max-w-2xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <FeatureBox
            title="Generate Brand names"
            description="Instant brand name generator"
            icon={<BrainCog />}
            idx={1}
          />
          <FeatureBox
            title="Check Domain availability"
            description="We check the domain availability for you"
            icon={<Check />}
            idx={2}
          />
          <FeatureBox
            title="Save your favorites"
            description="Save your favorite Brand names for later"
            icon={<Star />}
            idx={3}
          />
        </div>
      </div>

      <div className="max-sm:px-8 w-full flex flex-col mt-20 md:mt-28 xl:mt-36">
        <div className="mx-auto md:max-w-7xl relative">
          <div className="absolute h-full w-full bg-gradient-to-r from-slate-900/20 dark:blur-sm to-transparent to-10% rounded-b-3xl" />
          <div className="absolute h-full w-full bg-gradient-to-t from-slate-900/20 dark:blur-sm to-transparent to-10% rounded-b-3xl" />
          <div className="absolute h-full w-full bg-gradient-to-l from-slate-900/20 dark:blur-sm to-transparent to-10% rounded-b-3xl" />
          <div className="absolute h-full w-full bg-gradient-to-b from-white via-white dark:from-slate-950 to-transparent to-10% md:to-20% lg:to-30% z-10" />

          <div className="relative p-8 sm:p-12 md:p-20 lg:p-32 border-b border-x border-slate-900 rounded-3xl flex flex-col gap-10 md:gap-16 lg:gap-24">
            <div className="flex flex-col gap-3 items-center text-center">
              <span className="text-5xl md:text-6xl font-medium">
                Numbers don&apos;t lie
              </span>
              <span className="md:text-lg text-gray-500 dark:text-gray-400 font-light">
                We helped thousands of people to find the perfect brand name.
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-x-8 gap-y-12 text-center lg:grid-cols-2">
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-500 dark:text-gray-400">
                  Generated Names
                </dt>
                <dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
                  40.000+
                </dd>
              </div>
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-500 dark:text-gray-400">
                  Total Users
                </dt>
                <dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
                  1.900+
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mb-10 md:mb-16" />
    </div>
  )
}

const TextBlock = ({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) => {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 text-center', className)}
    >
      <span className="text-4xl font-bold">{title}</span>
      <span className="text-gray-500 dark:text-gray-400 mx-auto">
        {description}
      </span>
    </div>
  )
}

const FeatureBox = ({
  title,
  description,
  icon,
  idx,
}: {
  title: string
  description: string
  icon: React.ReactNode
  idx: number
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border dark:border-gray-100/30 border-gray-900/30 p-5 lg:p-7 flex gap-4 justify-between bg-gradient-to-b from-white to-white dark:from-slate-950 dark:to-slate-950 dark:hover:to-slate-900 hover:to-slate-50 duration-100'
      )}
    >
      <div className="flex flex-col">
        <p className="text-2xl font-semibold">{title}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <div className="relative bg-primary text-primary-foreground p-2 rounded-xl h-fit">
        {icon}
      </div>
    </div>
  )
}
