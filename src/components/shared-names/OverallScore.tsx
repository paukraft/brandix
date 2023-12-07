import { SimpleTooltip } from '@/components/ui/SimpleTooltip'
import { CircularProgessbar } from '@/components/ui/circular-progessbar'
import { getNameFromDB } from '@/lib/getNameFromDB'

type Props = {
  name: string
}

export const OverallScore = async ({ name }: Props) => {
  const nameFromDB = await getNameFromDB({
    name,
    generate: ['scores'],
  })

  return (
    <SimpleTooltip title="Overall score">
      <CircularProgessbar value={nameFromDB?.score ?? 0} size="small" />
    </SimpleTooltip>
  )
}
