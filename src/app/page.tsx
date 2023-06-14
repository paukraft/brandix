import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div className="px-4 container mx-auto flex items-center flex-col mt-20 gap-6">
        <Link href="/generate">
          <Button variant="outline" className="rounded-full group/generate">
            Generate for free
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
          Have an Idea? We generate the perfect Brandname for you. As an bonus
          we also instantly check the domain availability for you.
        </div>
      </div>
    </>
  )
}
