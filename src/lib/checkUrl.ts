import { Domain } from '@/app/generate/page'

type CheckUrl = ({
  url,
}: {
  url: string
}) => Promise<{ domain: Partial<Domain>; response?: { statusText: string } }>

export const checkUrl: CheckUrl = async ({ url }) => {
  const response = await fetch('/api/check-domain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domain: url }),
  })

  if (!response.ok) {
    return {
      domain: {
        errorWhileChecking: true,
      },
      response: {
        statusText: response.statusText,
      },
    }
  }

  const data = await response.json()

  return {
    domain: {
      available: data.available,
      cantFigureOutAvailability: data.available === undefined,
      whois: data.whois,
      onlyProbably: data.onlyProbably,
    },
  }
}
