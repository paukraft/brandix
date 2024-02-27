import { getNameFromDB } from '@/lib/getNameFromDB'
import Link from 'next/link'
import { Card } from '../card'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'

type Props = {
  name: string
}

export const SimilarNames = async ({ name }: Props) => {
  const nameFromDB = await getNameFromDB(name)

  return (
    <ScrollArea>
      <div className="flex gap-4">
        {/* Map over max 5 names */}
        {nameFromDB?.similarNames?.slice(0, 5).map((name) => (
          <Link href={`/shared-names/${name}`} key={name} rel="nofollow">
            <Card className="w-full p-0 py-1 px-2">
              <span>{name}</span>
            </Card>
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
