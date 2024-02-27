'use client'

import { UpvoteButton } from '@/components/shared-names/upvote-button'
import { SimpleTooltip } from '@/components/ui/SimpleTooltip'
import { getNameClient } from '@/lib/client/sharedNamesClient'
import { useQuery } from '@tanstack/react-query'

export const UpvoteWrapper = ({
  name,
  styledButton,
}: {
  name: string
  styledButton?: boolean
}) => {
  const { data, refetch } = useQuery({
    queryKey: ['name', name],
    queryFn: () => getNameClient(name),
    enabled: !!name,
  })

  if (!data) {
    return null
  }

  return (
    <SimpleTooltip title="Upvotes">
      <UpvoteButton
        name={name}
        votes={data.votes ?? 0}
        refetch={refetch}
        styledButton={styledButton}
      />
    </SimpleTooltip>
  )
}
