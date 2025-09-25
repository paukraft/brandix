import z from 'zod'

export const NAME_STYLES = {
  'compound-words': {
    title: 'Compound Words',
    description: 'like Instagram and MasterCard',
    examples: ['PayPal', 'LinkedIn', 'YouTube'],
  },
  'alternate-spellings': {
    title: 'Alternate Spelling',
    description: 'creative spellings and variations',
    examples: ['Lyft', 'Flickr', 'Tumblr'],
  },
  descriptive: {
    title: 'Descriptive',
    description: 'literal category, use case, or benefit',
    examples: ['Shopify', 'Salesforce', 'Dropbox'],
  },
  'blended-words': {
    title: 'Blended Words',
    description: 'word blends and portmanteaus',
    examples: ['Microsoft', 'Pinterest', 'Groupon'],
  },
  'abstract-coined': {
    title: 'Abstract/Coined',
    description: 'invented words or neologisms',
    examples: ['Kodak', 'Xerox', 'Verizon'],
  },
  metaphorical: {
    title: 'Metaphorical',
    description: 'symbolic imagery or concepts',
    examples: ['Apple', 'Shell', 'Jaguar'],
  },
} as const

export type NameStyleKey = keyof typeof NAME_STYLES

export const nameStyleDetailSchema = z.object({
  title: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
})

export const generatorSettingsSchema = z
  .object({
    // Backward-compatible: array of selected keys
    nameStyles: z.array(z.string()).optional(),
    // Preferred: a map of selected key -> full detail object
    nameStyleDetails: z.record(z.string(), nameStyleDetailSchema).optional(),
  })
  .passthrough()

export type GeneratorSettings = z.infer<typeof generatorSettingsSchema>
