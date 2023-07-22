'use client'
import { SimpleTooltip } from '@/components/ui/SimpleTooltip'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { ArrowBigUp } from 'lucide-react'
import { useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

type Props = {
  refetch: () => void
  name: string
  votes: number
  styledButton?: boolean
}

export const UpvoteButton = ({ name, refetch, votes, styledButton }: Props) => {
  const { toast } = useToast()
  const [upvotedNames, setUpvotedNames] = useLocalStorage<string[]>(
    'upvotedNames',
    []
  )

  const isUpvoted = useMemo(
    () => upvotedNames.includes(name),
    [name, upvotedNames]
  )

  const upvoteName = async (name: string) => {
    if (upvotedNames.includes(name)) return

    await fetch('/api/upvote-name', {
      method: 'POST',
      body: JSON.stringify({
        name,
      }),
    }).then((res) => {
      if (res.status === 429) {
        toast({
          title: "Howdy cowboy, you're upvoting too fast!",
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Upvoted',
        })
        setUpvotedNames([...upvotedNames, name])
        refetch()
      }
    })
  }

  return (
    <SimpleTooltip title={isUpvoted ? 'Upvoted' : 'Upvote'}>
      <HybridButton
        className={cn(
          'flex items-center',
          isUpvoted
            ? 'disabled:opacity-100 dark:text-white dark:border-white text-black border-black'
            : !styledButton &&
                'text-muted-foreground hover:text-black dark:hover:text-white'
        )}
        onClick={(e) => {
          e.stopPropagation()
          upvoteName(name)
        }}
        disabled={isUpvoted}
        styledButton={styledButton}
      >
        <ArrowBigUp strokeWidth={isUpvoted ? 2 : 1.5} className="h-5 w-5" />
        {votes}
      </HybridButton>
    </SimpleTooltip>
  )
}

const HybridButton = ({
  styledButton,
  ...props
}: {
  styledButton?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  if (styledButton) {
    return <Button variant="outline" {...props} />
  } else {
    return <button {...props} />
  }
}
