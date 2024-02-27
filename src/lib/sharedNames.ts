import { prisma } from '@/lib/prisma'

// model Name {
//   id          String   @id @default(cuid())
//   createdAt   DateTime @default(now())
//   name        String   @unique
//   description String   @db.MediumText
//   score       Int      @default(0)

//   votes Int @default(0)

//   uniqueness               Int    @default(0)
//   uniquenessDescription    String @db.MediumText
//   memorability             Int    @default(0)
//   memorabilityDescription  String @db.MediumText
//   pronunciation            Int    @default(0)
//   pronunciationDescription String @db.MediumText
//   spelling                 Int    @default(0)
//   spellingDescription      String @db.MediumText
//   positivity               Int    @default(0)
//   positivityDescription    String @db.MediumText
//   versatility              Int    @default(0)
//   versatilityDescription   String @db.MediumText
//   globalAppeal             Int    @default(0)
//   globalAppealDescription  String @db.MediumText

//   // Self relation
//   similarNames Name[] @relation("SimilarNames")
//   similarTo    Name[] @relation("SimilarNames")
// }

export const newNameData = {
  description: '',
  votes: 1,
  uniquenessDescription: '',
  memorabilityDescription: '',
  pronunciationDescription: '',
  spellingDescription: '',
  positivityDescription: '',
  versatilityDescription: '',
  globalAppealDescription: '',
}

export const addName = async ({ name }: { name: string }) => {
  try {
    await prisma.name.create({
      data: {
        name,
        ...newNameData,
      },
    })
  } catch (error) {}
}

export const upvoteName = async ({ name }: { name: string }) => {
  await prisma.name.update({
    where: {
      name,
    },
    data: {
      votes: {
        increment: 1,
      },
    },
  })
}

export const getTopNames = async ({
  limit,
  cursor,
  timespanInDays,
}: {
  limit?: number
  cursor?: string
  timespanInDays?: number
}) => {
  const names = await prisma.name.findMany({
    where: {
      AND: [
        timespanInDays
          ? {
              createdAt: {
                gte: new Date(
                  Date.now() - timespanInDays * 24 * 60 * 60 * 1000
                ),
              },
            }
          : {},
        {
          votes: {
            gt: 0,
          },
        },
      ],
    },
    take: limit,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: [
      {
        votes: 'desc',
      },
      {
        createdAt: 'asc',
      },
    ],
  })

  return {
    names: names,
    nextCursor: names[names.length - 1]
      ? names[names.length - 1].id
      : undefined,
  }
}

export const getName = async ({ name }: { name: string }) => {
  const nameData = await prisma.name.findUnique({
    where: {
      name,
    },
  })

  return nameData
}
