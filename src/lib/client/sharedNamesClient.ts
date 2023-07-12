import { Name } from '@prisma/client'

export const getTopNamesClient = async ({
  pageParam,
  timespanInDays,
}: {
  pageParam?: number
  timespanInDays?: number
}) => {
  const response = await fetch(
    `/api/get-top-names?cursor=${pageParam ?? ''}&timespanInDays=${
      timespanInDays ?? ''
    }`,
    {
      method: 'GET',
    }
  )

  const { names, nextCursor }: { names: Name[]; nextCursor: string } =
    await response.json()

  return { data: names, nextCursor }
}
