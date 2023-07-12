import { prisma } from '@/lib/prisma'

export const addName = async ({ name }: { name: string }) => {
  await prisma.name.create({
    data: {
      name,
    },
  })
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
