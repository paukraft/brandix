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

export const getNameClient = async (name: string) => {
  const response = await fetch(`/api/get-name?name=${name}`, {
    method: 'GET',
  })

  const { name: nameFromDB }: { name: Name } = await response.json()

  return nameFromDB
}

export const shareNameClient = async ({ name }: { name: string }) => {
  await fetch('api/share-name', {
    method: 'POST',
    body: JSON.stringify({
      name: name,
    }),
  })
}
