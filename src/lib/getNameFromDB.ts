import { filter, map, some, uniq } from 'lodash'
import { cache } from 'react'
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

export const getNameFromDB = cache(
  async ({
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

    let similarNames = getSimilarNames({ nameFromDB })

    const updates = await Promise.all([
      new Promise(async (resolve) => {
        // Check if description generation is needed
        if (!generate.includes('description') || nameFromDB?.description) {
          return resolve(false)
        }

        // Generate new description using GPT
        const newDescriptionCompletion = await askGPT({
          model: 'gpt-3.5-turbo',
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

        let newDescription = newDescriptionCompletion.message?.content

        if (!newDescription) {
          return resolve(false)
        }

        // If starts with "Analysis of the brand name" remove first line
        if (newDescription.startsWith(`Analysis of the brand name`)) {
          newDescription = newDescription.split('\n').slice(1).join('\n')
        }

        // Remove all empty lines at the beginning
        while (newDescription.startsWith('\n')) {
          newDescription = newDescription.slice(1)
        }

        const stillNeedsUpdate = !(
          await prisma.name.findUnique({
            where: {
              name,
            },
          })
        )?.description

        if (!stillNeedsUpdate) {
          return resolve(true)
        }

        // Update the name with the new description
        await prisma.name.update({
          where: {
            name: name,
          },
          data: {
            description: newDescription,
          },
        })

        return resolve(true)
      }),
      new Promise(async (resolve) => {
        // Check if score generation is needed
        if (!generate.includes('scores') || nameFromDB?.score) {
          return resolve(false)
        }

        // Generate scores using GPT
        const scoring = await askGPT({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a brand analyst. There is a sendScores function with lots of criteria. Give a score from 0 to 100 to each criteria. And give a description to each criteria why the name is good or not good.`,
            },
            {
              role: 'user',
              content: `Give scores and descriptions to the name "${name}" to each criteria.`,
            },
          ],
          functions: [
            {
              name: 'sendScores',
              description: 'Send the scores and descriptions to this function',
              parameters: transformZodSchemaToOpenAi(scoreSchema),
            },
          ],
          temperature: 0.5,
        })

        const scores = scoreSchema.parse(
          JSON.parse(scoring.message?.function_call?.arguments || '{}')
        )

        const scoresArray = map(Object.values(scores), (score) => score.score)

        const generalScore =
          scoresArray.reduce((acc, curr) => acc + curr, 0) / scoresArray.length

        const stillNeedsUpdate = !(
          await prisma.name.findUnique({
            where: {
              name,
            },
          })
        )?.score

        if (!stillNeedsUpdate) {
          return resolve(true)
        }

        // Update the name with the generated scores
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
        // Check if similar names generation is needed
        if (!generate.includes('similar') || similarNames.length >= 5) {
          return resolve(false)
        }

        const nrOfSimilarNames = 5

        const similarNamesSchema = z.object({
          similarNames: z.array(z.string()),
        })

        // Generate new similar names using GPT
        const newSimilarNamesREQ = await askGPT({
          model: 'gpt-3.5-turbo',
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

        const newSimilarNames = similarNamesSchema.parse(
          JSON.parse(
            newSimilarNamesREQ.message?.function_call?.arguments || '{}'
          )
        )

        const stillNeedsUpdate =
          getSimilarNames({
            nameFromDB: await prisma.name.findUnique({
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
            }),
          }).length < nrOfSimilarNames

        if (!stillNeedsUpdate) {
          return resolve(true)
        }

        // Update the name with the new similar names
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

      similarNames = filter(
        uniq([
          ...(nameFromDB?.similarNames.map((n) => n.name) || []),
          ...(nameFromDB?.similarTo.map((n) => n.name) || []),
        ]),
        (n) => n !== name
      )
    }

    return { ...nameFromDB, similarNames }
  }
)
