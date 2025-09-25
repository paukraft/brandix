import { cn } from '@/lib/utils'
import Image from 'next/image'
import LogoBlack from '../assets/logo-black.svg'
import LogoWhite from '../assets/logo-white.svg'

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative size-10', className)}>
      <Image src={LogoWhite} alt="Logo" fill className="hidden dark:block" />
      <Image src={LogoBlack} alt="Logo" fill className="block dark:hidden" />
    </div>
  )
}
