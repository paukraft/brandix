import { OpenAIModel } from '@/lib/openAiStream'
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from 'openai'
import { cache } from 'react'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const askGPT = cache(
  async ({
    model,
    messages,
    functions = undefined,
    temperature = 1,
  }: {
    model: OpenAIModel
    messages: ChatCompletionRequestMessage[]
    functions?: ChatCompletionFunctions[]
    temperature?: number
  }) => {
    const chatCompletion = await openai.createChatCompletion({
      model,
      messages: messages,
      functions,
      temperature: temperature,
    })

    return chatCompletion.data.choices[0]
  }
)
