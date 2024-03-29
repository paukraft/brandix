import { generateSimilarNames } from '@/lib/getNameFromDB'
import Link from 'next/link'
import { Card } from '../card'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'

type Props = {
  name: string
}

export const SimilarNames = async ({ name }: Props) => {
  const similarNames = await generateSimilarNames(name, 10)

  return (
    <ScrollArea>
      <div className="flex gap-4">
        {similarNames.map((name) => (
          <Link href={`/shared-names/${name}`} key={name} rel="nofollow">
            <Card className="w-full p-0 py-1 px-2 whitespace-nowrap">
              <span>{name}</span>
            </Card>
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
