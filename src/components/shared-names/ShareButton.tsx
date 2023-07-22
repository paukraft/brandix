'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { shareOrCopy } from '@/lib/utils'
import { Share } from 'lucide-react'
import { SimpleTooltip } from '../ui/SimpleTooltip'

type Props = {
  name: string
}

export const ShareButton = ({ name }: Props) => {
  const { toast } = useToast()
  return (
    <SimpleTooltip title="Share">
      <Button
        onClick={() => {
          const toastText = shareOrCopy({
            title: `Brandix - ${name}`,
            url: `${window.location.origin}/shared-names/${name}`,
            copySuccessMessage: 'Link copied to clipboard',
          })

          if (toastText) toast({ title: toastText })
        }}
        variant="outline"
        className="gap-2"
      >
        <Share className="h-5 w-5 shrink-0" />
        <span className="max-sm:hidden">Share</span>
      </Button>
    </SimpleTooltip>
  )
}
