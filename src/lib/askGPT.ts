import { OpenAIModel } from '@/lib/openAiStream'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const askGPT = async ({
  model,
  messages,
}: {
  model: OpenAIModel
  messages: ChatCompletionRequestMessage[]
}) => {
  const chatCompletion = await openai.createChatCompletion({
    model,
    messages: messages,
  })

  return chatCompletion.data.choices[0]
}
