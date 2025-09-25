import z from 'zod'

export const suggestionSchema = z.object({
  domain: z
    .string()
    .describe('e.g. "google.com", "facebook.com", "twitter.com"'),
  name: z.string().describe('e.g. "Google", "Facebook", "Twitter"'),
})

export type SuggestionType = z.infer<typeof suggestionSchema>

export const analysisCriteriaSchema = z.object({
  suggestion: suggestionSchema,
  criteria: z.array(
    z.object({
      name: z.string(),
      analysis: z.string(),
      weight: z.number(),
      score: z
        .number()
        .min(0)
        .max(10)
        .describe('0-5 is poor, 6-7 is good, 8-10 is excellent'),
    })
  ),
  conclusion: z.string(),
})

export type AnalysisCriteriaType = z.infer<typeof analysisCriteriaSchema>
