import { getNameFromDB } from '@/lib/getNameFromDB'

type Props = {
  name: string
}

export const NameDescription = async ({ name }: Props) => {
  const nameFromDB = await getNameFromDB({
    name,
    generate: ['description'],
  })

  return <div>{nameFromDB?.description}</div>
}
