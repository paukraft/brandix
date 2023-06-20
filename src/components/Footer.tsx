import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full flex-1 flex flex-col justify-end">
      <div className="container mx-auto flex items-center justify-between py-2">
        <Link
          href="https://twitter.com/paukraft"
          className="text-xs text-gray-500 hover:underline"
          target={'_blank'}
        >
          by Pau Kraft
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/imprint">
            <p className="text-sm text-gray-500  hover:underline">Imprint</p>
          </Link>
          <Link href="/privacy">
            <p className="text-sm text-gray-500  hover:underline">Privacy</p>
          </Link>
        </div>
      </div>
    </footer>
  )
}
