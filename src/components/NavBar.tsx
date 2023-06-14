import Link from 'next/link'
import { Button } from './ui/button'

export const NavBar = () => {
  return (
    <header className="border-b border-gray-300 dark:border-gray-800 w-full sticky top-0">
      <div className="px-4 container w-full flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/">
          <div className="text-4xl">Domained.ai</div>
        </Link>

        {/* CTA */}
        <Link href="/generate">
          <Button variant="outline">Get started</Button>
        </Link>
      </div>
    </header>
  )
}
