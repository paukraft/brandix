import Image from 'next/image'
import Link from 'next/link'
import LogoBlack from '../assets/logo-black.svg'
import LogoWhite from '../assets/logo-white.svg'
import { ModeToggle } from './ModeToggle'
import { Button } from './ui/button'
import { Icons } from './ui/icons'

export const NavBar = () => {
  return (
    <>
      <header className="border-b border-gray-300 dark:border-gray-800 w-full fixed top-0 backdrop-blur-lg bg-white/60 dark:bg-slate-950/60 z-10">
        <div className="container px-4 w-full flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-end">
              <div className="relative h-9 aspect-square">
                <Image
                  fill
                  src={LogoWhite}
                  alt="Logo"
                  className="hidden dark:block"
                />
                <Image
                  fill
                  src={LogoBlack}
                  alt="Logo"
                  className="dark:hidden"
                />
              </div>
              <div className="text-3xl leading-none -translate-x-1">randix</div>
            </div>
          </Link>

          {/* CTA */}
          <div className="flex items-center">
            <Link href="/shared-names" className="max-sm:hidden">
              <Button variant="link">Community Names</Button>
            </Link>
            <Button variant="ghost" size="icon" name="My personal twitter">
              <Link
                href="https://twitter.com/paukraft"
                target={'_blank'}
                aria-label="My personal twitter"
              >
                <Icons.twitter className="h-4 w-4" />
              </Link>
            </Button>
            <ModeToggle />
            <Link href="/generate" className="ml-1">
              <Button variant="outline" className="rounded-full flex gap-1">
                Start <span className="hidden sm:block">generating</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="h-16" />
    </>
  )
}
