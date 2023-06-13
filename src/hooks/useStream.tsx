import { useState } from 'react'

export const useStream = () => {
  // const [chatroomIdsResponse, setChatroomIdsResponse] = useState<{
  //   [key: string]: { responseString: string; messageIsStreaming: boolean };
  // }>({});

  const [streamResponse, setStreamResponse] = useState<{
    responseString: string
    messageIsStreaming: boolean
  }>({
    responseString: '',
    messageIsStreaming: false,
  })

  const send = async ({ url, body }: { url: string; body?: object }) => {
    setStreamResponse({ responseString: '', messageIsStreaming: false })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorMessage = await response.text()

      throw new Error(
        errorMessage ||
          'Domained is not able to answer currently. Please try again later.'
      )
    }

    const data = response.body

    if (!data) {
      throw new Error(
        'Domained is not able to answer currently. Please try again later.'
      )
    }

    setStreamResponse({ responseString: '', messageIsStreaming: true })

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false
    let text = ''

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      text += chunkValue

      setStreamResponse({
        responseString: text,
        messageIsStreaming: true,
      })
    }
    setStreamResponse({ responseString: text, messageIsStreaming: false })
  }

  return {
    send,
    streamResponse,
  }
}
