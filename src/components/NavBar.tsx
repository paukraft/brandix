import Image from 'next/image'
import Link from 'next/link'
import LogoBlack from '../assets/logo-black.svg'
import LogoWhite from '../assets/logo-white.svg'
import { ModeToggle } from './ModeToggle'
import { Button } from './ui/button'

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
          <div className="flex gap-2 items-center">
            <ModeToggle />
            <Link href="/generate">
              <Button variant="outline">Start generating</Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="h-16" />
    </>
  )
}
