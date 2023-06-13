import { cn } from '@/lib/utils'
import { Copy } from 'lucide-react'
import { useToast } from './use-toast'

export const CopyButton = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => {
  const { toast } = useToast()

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        toast({
          title: 'Copied to clipboard',
        })
      }}
      className={cn('', className)}
    >
      <Copy size={12} />
    </button>
  )
}
