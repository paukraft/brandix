import { OpenAIModel } from '@/lib/openAiStream'
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionRequest,
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
    options,
  }: {
    model: OpenAIModel
    messages: ChatCompletionRequestMessage[]
    functions?: ChatCompletionFunctions[]
    temperature?: number
    options?: Partial<CreateChatCompletionRequest>
  }) => {
    const chatCompletion = await openai.createChatCompletion({
      ...options,
      model,
      messages: messages,
      functions,
      temperature: temperature,
    })

    return chatCompletion.data.choices[0]
  }
)
