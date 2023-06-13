import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Blob */}
      <div className="absolute top-0 -translate-y-1/2 container w-full aspect-square bg-blue-950 rounded-full right-0 left-0 blur-3xl opacity-10 scale-125 pointer-events-none" />

      {/* NavBar */}
      <NavBar />

      {/* Hero */}
      <div className="px-4 container mx-auto flex items-center flex-col mt-20 gap-6">
        <Link href="/generate">
          <Button variant="outline" className="rounded-full">
            Generate for free
            <ArrowRight className="ml-2 w-4" />
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
    </main>
  );
}
