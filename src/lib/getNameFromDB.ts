import { filter, map, uniq } from 'lodash'
import { cache } from 'react'
import { z } from 'zod'
import { askGPT } from './askGPT'
import { OpenAIModel } from './openAiStream'
import { prisma } from './prisma'
import { newNameData } from './sharedNames'
import { transformZodSchemaToOpenAi } from './transformZodSchemaToOpenAi'

const llmToUse: OpenAIModel = 'gpt-4-1106-preview'

const desiredSimilarNames = 5

const scoreDescriptionSchema = z.object({
  uniquenessDescription: z.string(),
  memorabilityDescription: z.string(),
  pronunciationDescription: z.string(),
  spellingDescription: z.string(),
  positivityDescription: z.string(),
  versatilityDescription: z.string(),
  globalAppealDescription: z.string(),
})

const scoreScoreSchema = z.object({
  uniqueness: z.number(),
  memorability: z.number(),
  pronunciation: z.number(),
  spelling: z.number(),
  positivity: z.number(),
  versatility: z.number(),
  globalAppeal: z.number(),
})

const similarNamesSchema = z.object({
  similarNames: z.array(z.string()),
})

export const getNameFromDB = cache(async (name: string) => {
  const initialName = await prisma.name.findUnique({
    where: {
      name,
    },
    include: {
      similarNames: true,
      similarTo: true,
    },
  })

  const initialSimilarNames = getSimilarNames({ nameFromDB: initialName })

  const promises = [
    async () => {
      if (!initialName?.description) {
        const description = await generateDescription(name)

        return description
      }
    },
    async () => {
      if (initialName?.uniquenessDescription === '') {
        const textAnalysis = await generateTextAnalysis(name)
        const scores = await generateScores(name, textAnalysis)

        return {
          textAnalysis,
          scores,
        }
      }
    },
    async () => {
      if (initialSimilarNames.length < desiredSimilarNames) {
        const similarNames = await generateSimilarNames(
          name,
          desiredSimilarNames - initialSimilarNames.length
        )

        return similarNames
      }
    },
  ]

  const results = await Promise.allSettled(promises.map((p) => p()))

  const newDescription =
    results[0].status === 'fulfilled' &&
    (results[0].value as string | undefined)
  const newTextAnalysis =
    results[1].status === 'fulfilled' &&
    (results[1].value as
      | {
          textAnalysis: z.infer<typeof scoreDescriptionSchema>
          scores: {
            scores: z.infer<typeof scoreScoreSchema>
            generalScore: number
          }
        }
      | undefined)
  const newSimilarNames =
    results[2].status === 'fulfilled' &&
    (results[2].value as
      | z.infer<typeof similarNamesSchema>['similarNames']
      | undefined)

  // If any of the results isn't undefined, update the database
  if (newDescription || newTextAnalysis || newSimilarNames) {
    const descriptionUpdate = newDescription
      ? {
          description: newDescription,
        }
      : {}

    const textAnalysisUpdate = newTextAnalysis
      ? {
          ...newTextAnalysis.textAnalysis,
          ...newTextAnalysis.scores.scores,
          score: newTextAnalysis.scores.generalScore,
        }
      : {}

    const similarNamesUpdate = newSimilarNames
      ? {
          similarNames: {
            connectOrCreate: newSimilarNames.map((name) => ({
              where: {
                name,
              },
              create: {
                name,
                ...newNameData,
              },
            })),
          },
        }
      : {}

    await prisma.name.update({
      where: {
        name,
      },
      data: {
        ...descriptionUpdate,
        ...textAnalysisUpdate,
        ...similarNamesUpdate,
      },
    })
  }

  const nameFromDB =
    newDescription || newTextAnalysis || newSimilarNames
      ? await prisma.name.findUnique({
          where: {
            name,
          },
          include: {
            similarNames: true,
            similarTo: true,
          },
        })
      : initialName

  return {
    ...nameFromDB,
    similarNames: getSimilarNames({ nameFromDB }),
  }
})

const generateDescription = cache(async (name: string) => {
  const res = await askGPT({
    model: llmToUse,
    messages: [
      {
        role: 'system',
        content: `You are a Market Research Analyst. You get a brand or business name. Your Job is to write an first analysis about that name. Don't split it up into multiple segments. Be critical because our customers count on our analysis. Always start with "Analysis of the brand name "BRANDNAME":".`,
      },
      {
        role: 'user',
        content: name,
      },
    ],
    temperature: 0.5,
  })

  return res.message?.content
})

const generateTextAnalysis = cache(async (name: string) => {
  const res = await askGPT({
    model: llmToUse,
    messages: [
      {
        role: 'system',
        content: `You are a Market Research Analyst. Your task is to evaluate a brand or business name based on various criteria. You need to provide a detailed assessment, explaining the strengths or weaknesses for each criterion. Provide reasons.`,
      },
      {
        role: 'user',
        content: `${name}`,
      },
    ],
    options: {
      function_call: { name: 'sendAnalysation' },
    },
    functions: [
      {
        name: 'sendAnalysation',
        description: 'Send your detailed assessments to this function',
        parameters: transformZodSchemaToOpenAi(scoreDescriptionSchema),
      },
    ],
    temperature: 0.7,
  })

  const analysations = scoreDescriptionSchema.parse(
    JSON.parse(res.message?.function_call?.arguments || '{}')
  )

  return analysations
})

const generateScores = cache(
  async (
    name: string,
    analysations: z.infer<typeof scoreDescriptionSchema>
  ) => {
    const gptScores = await askGPT({
      model: llmToUse,
      messages: [
        {
          role: 'system',
          content:
            'You are brandnameGPT, you job is to give scores in different criteria to a given brandname. Scores are from 0 to 100, 100 being the best. Another analyst has given an analasys in text form to each criteria before. Your scores should be based on that.',
        },
        {
          role: 'user',
          content: `
        Brandname: ${name}
        Analysation:
        Uniqueness: ${analysations.uniquenessDescription}
        Memorability: ${analysations.memorabilityDescription}
        Pronunciation: ${analysations.pronunciationDescription}
        Spelling: ${analysations.spellingDescription}
        Positivity: ${analysations.positivityDescription}
        Versatility: ${analysations.versatilityDescription}
        Global Appeal: ${analysations.globalAppealDescription}
        `,
        },
      ],
      options: {
        function_call: { name: 'sendScores' },
      },
      functions: [
        {
          name: 'sendScores',
          description: 'Send your scores to this function',
          parameters: transformZodSchemaToOpenAi(scoreScoreSchema),
        },
      ],
      temperature: 0.7,
    })

    const scores = scoreScoreSchema.parse(
      JSON.parse(gptScores.message?.function_call?.arguments || '{}')
    )

    const scoresArray = map(Object.values(scores), (score) => score)

    const generalScore =
      scoresArray.reduce((acc, curr) => acc + curr, 0) / scoresArray.length

    return {
      scores: scores,
      generalScore: generalScore,
    }
  }
)

const generateSimilarNames = cache(
  async (name: string, nrOfSimilarNames: number = 5) => {
    const res = await askGPT({
      model: llmToUse,
      messages: [
        {
          role: 'system',
          content: `You are brandnameGPT, your job is to generate Brandnames for a company which in the best case arent taken already.`,
        },
        {
          role: 'assistant',
          content: name,
        },
        {
          role: 'user',
          content: `Give me ${nrOfSimilarNames} more variations similar to ${name}, only brandnames no description or tagline`,
        },
      ],
      functions: [
        {
          name: 'sendNames',
          description: `Send ${nrOfSimilarNames} names to this function`,
          parameters: transformZodSchemaToOpenAi(similarNamesSchema),
        },
      ],
      temperature: 0.8,
    })

    const similarNames = similarNamesSchema.parse(
      JSON.parse(res.message?.function_call?.arguments || '{}')
    )

    return similarNames.similarNames
  }
)

const getSimilarNames = ({
  nameFromDB,
}: {
  nameFromDB: {
    name: string
    similarNames: {
      name: string
    }[]
    similarTo: {
      name: string
    }[]
  } | null
}) => {
  const similarNames = filter(
    uniq([
      ...(nameFromDB?.similarNames.map((n) => n.name) || []),
      ...(nameFromDB?.similarTo.map((n) => n.name) || []),
    ]),
    (n) => n !== nameFromDB?.name
  )

  return similarNames
}
