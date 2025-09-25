import { LanguageModelUsage } from 'ai'

const modelPricings = {
  'openai/gpt-5-mini': {
    costInDollarsPerMillionInputTokens: 0.25,
    costInDollarsPerMillionCachedInputTokens: 0.025,
    costInDollarsPerMillionOutputTokens: 2.0,
  },
  'openai/gpt-5': {
    costInDollarsPerMillionInputTokens: 1.25,
    costInDollarsPerMillionCachedInputTokens: 0.125,
    costInDollarsPerMillionOutputTokens: 10.0,
  },
  'openai/gpt-4.1': {
    costInDollarsPerMillionInputTokens: 2.0,
    costInDollarsPerMillionCachedInputTokens: 0.5,
    costInDollarsPerMillionOutputTokens: 8.0,
  },
  'openai/gpt-4.1-mini': {
    costInDollarsPerMillionInputTokens: 0.4,
    costInDollarsPerMillionCachedInputTokens: 0.1,
    costInDollarsPerMillionOutputTokens: 1.6,
  },
} as const

export type ModelId = keyof typeof modelPricings
export type Provider = ModelId extends `${infer P}/${string}` ? P : never
export type BaseModelId<P extends Provider = Provider> =
  ModelId extends `${P}/${infer Model}` ? Model : never

// Constrain OpenAI models to only those we have pricing for
export type ValidOpenAIModel = BaseModelId<'openai'>

// Helper to construct valid ModelId from provider and base model ID
export const makeModelId = <P extends Provider, T extends BaseModelId<P>>(
  provider: P,
  baseId: T
): `${P}/${T}` => {
  const modelId = `${provider}/${baseId}` as `${P}/${T}`

  // Runtime validation to ensure the model exists in pricing (should never fail due to types)
  if (!(modelId in modelPricings)) {
    throw new Error(`Model pricing not found for modelId: ${modelId}`)
  }

  return modelId
}

export const aisdkUsageToCost = ({
  usage,
  modelId,
}: {
  usage: LanguageModelUsage
  modelId: ModelId
}) => {
  const modelPricing = modelPricings[modelId as keyof typeof modelPricings]
  if (!modelPricing) {
    throw new Error(`Model pricing not found for modelId: ${modelId}`)
  }

  const costInDollarsInputTokens =
    ((usage.inputTokens || 0) *
      modelPricing.costInDollarsPerMillionInputTokens) /
    1_000_000

  const costInDollarsCachedInputTokens =
    ((usage.cachedInputTokens || 0) *
      modelPricing.costInDollarsPerMillionCachedInputTokens) /
    1_000_000

  const costInDollarsOutputTokens =
    ((usage.outputTokens || 0) *
      modelPricing.costInDollarsPerMillionOutputTokens) /
    1_000_000

  return {
    totalCostInDollars:
      costInDollarsInputTokens +
      costInDollarsCachedInputTokens +
      costInDollarsOutputTokens,
    inputTokensCost: costInDollarsInputTokens,
    cachedInputTokensCost: costInDollarsCachedInputTokens,
    outputTokensCost: costInDollarsOutputTokens,
  }
}
