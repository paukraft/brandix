import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from 'eventsource-parser'

export type Message = {
  role: 'user' | 'system' | 'assistant' | string
  content: string
}

export type OpenAIModel =
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-4-1106-preview'

export const openAIStream = async ({
  model,
  messages,
}: {
  model: OpenAIModel
  messages: Message[]
}) => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Organization': process.env.OPENAI_ORG_ID as string,
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: messages,
      // max_tokens: 1000,
      temperature: 0.8,
      stream: true,
    }),
    cache: 'no-cache',
  })

  const response = res.clone()

  if (res.status !== 200) {
    console.error(await res.text())
    throw new Error('OpenAI API returned an error')
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data

          if (data === '[DONE]') {
            controller.close()
            return
          }

          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(onParse)

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return { stream, response }
}
