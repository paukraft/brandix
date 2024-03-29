import { Score } from '@/components/shared-names/Score'
import { generateScoresComplete } from '@/lib/getNameFromDB'

type Props = {
  name: string
}

export const Scores = async ({ name }: Props) => {
  const scoresComplete = await generateScoresComplete(name)

  return (
    <div className="flex flex-col gap-6">
      <Score
        name="Uniqueness"
        score={scoresComplete.scores.scores.uniqueness ?? 0}
        description={scoresComplete.textAnalysis.uniquenessDescription ?? ''}
        helpText="This score reflects the rarity of the name. A higher score indicates a more unique and less commonly used name."
      />
      <Score
        name="Memorability"
        score={scoresComplete.scores.scores.memorability ?? 0}
        description={scoresComplete.textAnalysis.memorabilityDescription ?? ''}
        helpText="This score indicates how easily the name can be remembered. Names that are simple, catchy, and distinctive usually score higher."
      />
      <Score
        name="Global Appeal"
        score={scoresComplete.scores.scores.globalAppeal ?? 0}
        description={scoresComplete.textAnalysis.globalAppealDescription ?? ''}
        helpText="This score evaluates how well the name is likely to be received in different languages and cultures. A higher score suggests a more universally appealing name."
      />
      <Score
        name="Pronunciation"
        score={scoresComplete.scores.scores.pronunciation ?? 0}
        description={scoresComplete.textAnalysis.pronunciationDescription ?? ''}
        helpText="This score assesses the ease of pronouncing the name. Names that are easy to pronounce typically score higher."
      />
      <Score
        name="Spelling"
        score={scoresComplete.scores.scores.spelling ?? 0}
        description={scoresComplete.textAnalysis.spellingDescription ?? ''}
        helpText="This score indicates how easy it is to spell the name correctly. Names that are simple and follow common spelling rules usually score higher."
      />
      <Score
        name="Positivity"
        score={scoresComplete.scores.scores.positivity ?? 0}
        description={scoresComplete.textAnalysis.positivityDescription ?? ''}
        helpText="This score reflects the positive connotations associated with the name. Names that evoke positive emotions or meanings tend to score higher."
      />
      <Score
        name="Versatility"
        score={scoresComplete.scores.scores.versatility ?? 0}
        description={scoresComplete.textAnalysis.versatilityDescription ?? ''}
        helpText="This score evaluates the adaptability of the name for different types of businesses or industries. A higher score indicates a more versatile name."
      />
    </div>
  )
}
