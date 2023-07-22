import { LandingScreenshot } from '@/components/LandingScreenshot'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { BrainCog, Check, Star } from 'lucide-react'
import Link from 'next/link'

const FAQ: {
  question: string
  answer: string
  value: string
}[] = [
  {
    question: 'How does the AI brand name generator work?',
    answer: `Our AI brand name generator creates a list of unique brand names based on your input. You can pick from different categories or type in a brief description, and our AI will do the rest. If you like a name but want to see more like it, just hit the 'Generate Variations' button.`,
    value: 'how-does-it-work',
  },
  {
    question: 'Do I have to pay to use the brand name generator?',
    answer: `No, our brand name generator is completely free. You can generate as many names as you want without any charges. It's a handy tool for coming up with business names, product names, brand names, company names, project names, usernames, profilenames, domain names and more.`,
    value: 'how-much-does-it-cost',
  },
  {
    question: 'What types of names can I generate?',
    answer: `You can generate a wide variety of names using our tool. This includes business names, product names, brand names, company names, project names, usernames, profilenames, and even domain names. It's a versatile tool that can help you come up with the perfect name for almost anything.`,
    value: 'what-names-can-i-generate',
  },
  {
    question: 'How do I pick a good brand name?',
    answer: `A good brand name is short, easy to remember, and unique. You can use our brand name generator to come up with a list of names and then pick the one you like the most. If you have a name in mind, you can use our generator to create different versions of it.`,
    value: 'how-to-choose-a-good-brand-name',
  },
  {
    question: 'How does the domain availability check work?',
    answer: `Our brand name generator also checks if the generated brand names are available as domain names. This helps you make sure your chosen brand name can also be your website's domain name, keeping your brand consistent across different platforms.`,
    value: 'domain-availability-check',
  },
  {
    question: 'Can I save my favorite brand names for later?',
    answer: `Yes, you can save your favorite brand names. This lets you create a shortlist of names you like, which you can come back to and review whenever you want.`,
    value: 'save-favorite-brand-names',
  },
]

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

      <div className="container mx-auto flex justify-center gap-2 items-center max-md:mt-10">
        <Link href="/generate" className="relative">
          <div className="absolute top-0 blur-md h-full w-full inset-0 bg-gradient-to-r from-slate-600 to-indigo-500 group-hover:-inset-0.5 duration-100" />
          <Button size="lg" variant="default" className="text-lg relative">
            Start generating
          </Button>
        </Link>

        <Link href="/shared-names">
          <Button size="lg" variant="outline">
            Brandix community
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

      <LandingScreenshot />

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

      <div className="container mx-auto w-full flex flex-col mt-36 md:mt-44 lg:mt-72 gap-8 md:gap-14">
        <div className="font-semibold text-5xl md:text-7xl">
          Frequently asked questions
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((faq) => (
            <AccordionItem value={faq.question} key={faq.value}>
              <AccordionTrigger className="md:text-2xl md:pt-6 md:pb-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="md:text-lg md:pb-2 opacity-90">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
