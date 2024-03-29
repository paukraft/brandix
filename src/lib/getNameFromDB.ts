import { filter, map, uniq } from 'lodash'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { z } from 'zod'
import { askGPT } from './askGPT'
import { OpenAIModel } from './openAiStream'
import { prisma } from './prisma'
import { newNameData } from './sharedNames'
import { transformZodSchemaToOpenAi } from './transformZodSchemaToOpenAi'

const llmForDescription: OpenAIModel = 'gpt-4-1106-preview'
const llmForTextAnalysis: OpenAIModel = 'gpt-4-1106-preview'
const llmForScores: OpenAIModel = 'gpt-3.5-turbo'
const llmForSimilarNames: OpenAIModel = 'gpt-3.5-turbo'

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

export const getInitialName = cache(async (name: string) => {
  const initialName = await prisma.name.findUnique({
    where: {
      name,
    },
    include: {
      similarNames: true,
      similarTo: true,
    },
  })

  if (!initialName) {
    return notFound()
  }

  const initialSimilarNames = getSimilarNames({ nameFromDB: initialName })

  return {
    ...initialName,
    similarNames: initialSimilarNames,
  }
})

export const generateDescription = cache(async (name: string) => {
  const nameFromDB = await getInitialName(name)

  if (nameFromDB.description) {
    return nameFromDB.description
  }

  const res = await askGPT({
    model: llmForDescription,
    messages: [
      {
        role: 'system',
        content: `You are a Market Research Analyst. You get a brand or business name. Your Job is to write an first analysis about that name. Don't split it up into multiple segments. This is really just a regular overview analysation, we will go in greater detail an in smaller categories like versatility in a later analysation. Be critical because our customers count on our analysis. Just start with the analysation you dont need a title like Brand Analysis: ${name}.`,
      },
      {
        role: 'user',
        content: `generate me a description for ${name}`,
      },
    ],
    temperature: 0.5,
  })

  await prisma.name.update({
    where: {
      name,
    },
    data: {
      description: res.message?.content,
    },
  })

  return res.message?.content
})

export const generateScoresComplete = cache(async (name: string) => {
  const textAnalysis = await generateTextAnalysis(name)
  const scores = await generateScores(name, textAnalysis)

  await prisma.name.update({
    where: {
      name,
    },
    data: {
      ...textAnalysis,
      ...{
        ...textAnalysis,
        ...scores.scores,
        score: scores.generalScore,
      },
    },
  })

  return {
    textAnalysis,
    scores,
  }
})

const generateTextAnalysis = cache(async (name: string) => {
  const nameFromDB = await getInitialName(name)

  if (
    nameFromDB.uniquenessDescription &&
    nameFromDB.memorabilityDescription &&
    nameFromDB.pronunciationDescription &&
    nameFromDB.spellingDescription &&
    nameFromDB.positivityDescription &&
    nameFromDB.versatilityDescription &&
    nameFromDB.globalAppealDescription
  ) {
    return {
      uniquenessDescription: nameFromDB.uniquenessDescription,
      memorabilityDescription: nameFromDB.memorabilityDescription,
      pronunciationDescription: nameFromDB.pronunciationDescription,
      spellingDescription: nameFromDB.spellingDescription,
      positivityDescription: nameFromDB.positivityDescription,
      versatilityDescription: nameFromDB.versatilityDescription,
      globalAppealDescription: nameFromDB.globalAppealDescription,
    }
  }

  const res = await askGPT({
    model: llmForTextAnalysis,
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
    const nameFromDB = await getInitialName(name)

    if (
      nameFromDB.uniqueness &&
      nameFromDB.memorability &&
      nameFromDB.pronunciation &&
      nameFromDB.spelling &&
      nameFromDB.positivity &&
      nameFromDB.versatility &&
      nameFromDB.globalAppeal
    ) {
      return {
        scores: {
          uniqueness: nameFromDB.uniqueness,
          memorability: nameFromDB.memorability,
          pronunciation: nameFromDB.pronunciation,
          spelling: nameFromDB.spelling,
          positivity: nameFromDB.positivity,
          versatility: nameFromDB.versatility,
          globalAppeal: nameFromDB.globalAppeal,
        },
        generalScore: nameFromDB.score,
      }
    }

    const gptScores = await askGPT({
      model: llmForScores,
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

export const generateSimilarNames = cache(
  async (name: string, nrOfSimilarNames: number) => {
    const nameFromDB = await getInitialName(name)

    if (nameFromDB.similarNames.length >= nrOfSimilarNames) {
      return nameFromDB.similarNames
    }

    const res = await askGPT({
      model: llmForSimilarNames,
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

    similarNames.similarNames.map(async (name) => {
      await prisma.name.create({
        data: {
          name,
          ...newNameData,
          votes: 0,
          similarTo: {
            connect: {
              name: nameFromDB.name,
            },
          },
          similarNames: {
            connect: {
              name: nameFromDB.name,
            },
          },
        },
      })
    })

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
