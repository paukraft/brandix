import { generateDescription } from '@/lib/getNameFromDB'

type Props = {
  name: string
}

export const NameDescription = async ({ name }: Props) => {
  const nameFromDB = await generateDescription(name)

  return <div>{nameFromDB}</div>
}
