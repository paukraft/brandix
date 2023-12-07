import { filter, map, some, uniq } from 'lodash'
import { cache } from 'react'
import { z } from 'zod'
import { askGPT } from './askGPT'
import { OpenAIModel } from './openAiStream'
import { prisma } from './prisma'
import { transformZodSchemaToOpenAi } from './transformZodSchemaToOpenAi'

const llmToUse: OpenAIModel = 'gpt-4-1106-preview'

const scoreDescriptionSchema = z.object({
  uniqueness: z.string(),
  memorability: z.string(),
  pronunciation: z.string(),
  spelling: z.string(),
  positivity: z.string(),
  versatility: z.string(),
  globalAppeal: z.string(),
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
    generate = [],
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

    const updates = await Promise.allSettled([
      // Description
      new Promise(async (resolve) => {
        // Check if description generation is needed
        if (!generate.includes('description') || nameFromDB?.description) {
          return resolve(false)
        }

        // Generate new description using GPT
        const newDescriptionCompletion = await askGPT({
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
      // Scores
      new Promise(async (resolve) => {
        // Check if score generation is needed
        if (!generate.includes('scores') || nameFromDB?.score) {
          return resolve(false)
        }

        // Generate analysations to each criteria using GPT
        const gptAnalysation = await askGPT({
          model: llmToUse,
          messages: [
            {
              role: 'system',
              content: `You are a Market Research Analyst. Your task is to evaluate a brand or business name based on various criteria. You need to provide a detailed assessment, explaining the strengths or weaknesses for each criterion. Do not simply label it as 'good' or 'strong'. Provide reasons.`,
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
          JSON.parse(gptAnalysation.message?.function_call?.arguments || '{}')
        )

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
              Uniqueness: ${analysations.uniqueness}
              Memorability: ${analysations.memorability}
              Pronunciation: ${analysations.pronunciation}
              Spelling: ${analysations.spelling}
              Positivity: ${analysations.positivity}
              Versatility: ${analysations.versatility}
              Global Appeal: ${analysations.globalAppeal}
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
            uniqueness: scores.uniqueness,
            uniquenessDescription: analysations.uniqueness,
            memorability: scores.memorability,
            memorabilityDescription: analysations.memorability,
            pronunciation: scores.pronunciation,
            pronunciationDescription: analysations.pronunciation,
            spelling: scores.spelling,
            spellingDescription: analysations.spelling,
            positivity: scores.positivity,
            positivityDescription: analysations.positivity,
            versatility: scores.versatility,
            versatilityDescription: analysations.versatility,
            globalAppeal: scores.globalAppeal,
            globalAppealDescription: analysations.globalAppeal,
          },
        })

        return resolve(true)
      }),
      // Similar names
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

    const updatesFullfilled = updates.filter(
      (update): update is PromiseFulfilledResult<boolean> =>
        update.status === 'fulfilled'
    )

    if (some(updatesFullfilled, (update) => update.value)) {
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
