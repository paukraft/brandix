import Link from 'next/link'
import { Button } from './ui/button'

export const NavBar = () => {
  return (
    <header className="border-b border-gray-300 dark:border-gray-800 w-full sticky top-0 backdrop-blur-lg bg-white/60 dark:bg-slate-950/60 z-10">
      <div className="container w-full flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/">
          <div className="text-4xl">Brandix</div>
        </Link>

        {/* CTA */}
        <Link href="/generate">
          <Button variant="outline">Start generating</Button>
        </Link>
      </div>
    </header>
  )
}
