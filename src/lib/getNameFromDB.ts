import { map, some } from 'lodash'
import { z } from 'zod'
import { askGPT } from './askGPT'
import { prisma } from './prisma'
import { transformZodSchemaToOpenAi } from './transformZodSchemaToOpenAi'

const MAX_SCORE_DESCRIPTION_LENGTH = 300
const scoreSchema = z.object({
  uniqueness: z.object({
    score: z.number().int().min(0).max(100),
    description: z.string().min(0).max(MAX_SCORE_DESCRIPTION_LENGTH),
  }),
  memorability: z.object({
    score: z.number().int().min(0).max(100),
    description: z.string().min(0).max(MAX_SCORE_DESCRIPTION_LENGTH),
  }),
  pronunciation: z.object({
    score: z.number().int().min(0).max(100),
    description: z.string().min(0).max(MAX_SCORE_DESCRIPTION_LENGTH),
  }),
  spelling: z.object({
    score: z.number().int().min(0).max(100),
    description: z.string().min(0).max(MAX_SCORE_DESCRIPTION_LENGTH),
  }),
  positivity: z.object({
    score: z.number().int().min(0).max(100),
    description: z.string().min(0).max(MAX_SCORE_DESCRIPTION_LENGTH),
  }),
  versatility: z.object({
    score: z.number().int().min(0).max(100),
    description: z.string().min(0).max(MAX_SCORE_DESCRIPTION_LENGTH),
  }),
  globalAppeal: z.object({
    score: z.number().int().min(0).max(100),
    description: z.string().min(0).max(MAX_SCORE_DESCRIPTION_LENGTH),
  }),
})

export const getNameFromDB = async ({
  name,
  generate = ['description', 'scores', 'similar'],
}: {
  name: string
  generate?: ('description' | 'scores' | 'similar')[]
}) => {
  let nameFromDB = await prisma.name.findUnique({
    where: {
      name,
    },
    include: {
      similarNames: {
        select: {
          name: true,
        },
      },
      similarTo: {
        select: {
          name: true,
        },
      },
    },
  })

  let similarNames = [
    ...(nameFromDB?.similarNames.map((n) => n.name) || []),
    ...(nameFromDB?.similarTo.map((n) => n.name) || []),
  ]

  const updates = await Promise.all([
    new Promise(async (resolve) => {
      if (!generate.includes('description') || nameFromDB?.description) {
        return resolve(false)
      }

      const newDescription = await askGPT({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a brand analyst. Your job is to analyze a brand name. Write a short analysis with max 40 words. Try to be as objective as possible.`,
          },
          {
            role: 'user',
            content: name,
          },
        ],
      })

      await prisma.name.update({
        where: {
          name: name,
        },
        data: {
          description: newDescription.message?.content,
        },
      })

      return resolve(true)
    }),
    new Promise(async (resolve) => {
      if (!generate.includes('scores') || nameFromDB?.score) {
        return resolve(false)
      }

      const scoring = await askGPT({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a brand analyst. There is a sendScores function with lots of criteria. Give a score from 0 to 100 to each criteria. And give a description to each criteria why the name is good or not good.`,
          },
          {
            role: 'user',
            content: `Please give scores and descriptions to the name "${name}"`,
          },
        ],
        functions: [
          {
            name: 'sendScores',
            description: 'Send the scores to this function',
            parameters: transformZodSchemaToOpenAi(scoreSchema),
          },
        ],
      })

      const scores = scoreSchema.parse(
        JSON.parse(scoring.message?.function_call?.arguments || '{}')
      )

      const scoresArray = map(Object.values(scores), (score) => score.score)

      const generalScore =
        scoresArray.reduce((acc, curr) => acc + curr, 0) / scoresArray.length

      await prisma.name.update({
        where: {
          name: name,
        },
        data: {
          score: generalScore,
          uniqueness: scores.uniqueness.score,
          uniquenessDescription: scores.uniqueness.description,
          memorability: scores.memorability.score,
          memorabilityDescription: scores.memorability.description,
          pronunciation: scores.pronunciation.score,
          pronunciationDescription: scores.pronunciation.description,
          spelling: scores.spelling.score,
          spellingDescription: scores.spelling.description,
          positivity: scores.positivity.score,
          positivityDescription: scores.positivity.description,
          versatility: scores.versatility.score,
          versatilityDescription: scores.versatility.description,
          globalAppeal: scores.globalAppeal.score,
          globalAppealDescription: scores.globalAppeal.description,
        },
      })

      return resolve(true)
    }),
    new Promise(async (resolve) => {
      if (!generate.includes('similar') || similarNames.length >= 5) {
        return resolve(false)
      }

      const nrOfSimilarNames = 5

      const similarNamesSchema = z.object({
        similarNames: z.array(z.string()),
      })

      const newSimilarNamesREQ = await askGPT({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are brandnameGPT, your job is to generate brandname variations for a company which in the best case arent taken already. Always return exact ${nrOfSimilarNames} brandnames.`,
          },
          {
            role: 'user',
            content: `Give me ${nrOfSimilarNames} more variations similar to ${name}. Should be available as a .com domain.`,
          },
        ],
        functions: [
          {
            name: 'sendSimilarNames',
            description: `Send ${nrOfSimilarNames} similar names to this function`,
            parameters: transformZodSchemaToOpenAi(similarNamesSchema),
          },
        ],
      })

      const newSimilarNames = similarNamesSchema.parse(
        JSON.parse(newSimilarNamesREQ.message?.function_call?.arguments || '{}')
      )

      console.log(newSimilarNames.similarNames.length)

      await prisma.name.update({
        where: {
          name: name,
        },
        data: {
          similarNames: {
            connectOrCreate: map(newSimilarNames.similarNames, (newName) => ({
              where: {
                name: newName,
              },
              create: {
                name: newName,
              },
            })),
          },
        },
      })

      return resolve(true)
    }),
  ])

  if (some(updates)) {
    nameFromDB = await prisma.name.findUnique({
      where: {
        name,
      },
      include: {
        similarNames: {
          select: {
            name: true,
          },
        },
        similarTo: {
          select: {
            name: true,
          },
        },
      },
    })

    let similarNames = [
      ...(nameFromDB?.similarNames.map((n) => n.name) || []),
      ...(nameFromDB?.similarTo.map((n) => n.name) || []),
    ]
  }

  return { ...nameFromDB, similarNames }
}
