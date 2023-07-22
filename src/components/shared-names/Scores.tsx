import { Score } from '@/components/shared-names/Score'
import { getNameFromDB } from '@/lib/getNameFromDB'

type Props = {
  name: string
}

export const Scores = async ({ name }: Props) => {
  const nameFromDB = await getNameFromDB({ name, generate: ['scores'] })

  if (!nameFromDB) return null

  return (
    <div className="flex flex-col gap-6">
      <Score
        name="Uniqueness"
        score={nameFromDB.uniqueness}
        description={nameFromDB.uniquenessDescription}
        helpText="This score reflects the rarity of the name. A higher score indicates a more unique and less commonly used name."
      />
      <Score
        name="Memorability"
        score={nameFromDB.memorability}
        description={nameFromDB.memorabilityDescription}
        helpText="This score indicates how easily the name can be remembered. Names that are simple, catchy, and distinctive usually score higher."
      />
      <Score
        name="Global Appeal"
        score={nameFromDB.globalAppeal}
        description={nameFromDB.globalAppealDescription}
        helpText="This score evaluates how well the name is likely to be received in different languages and cultures. A higher score suggests a more universally appealing name."
      />
      <Score
        name="Pronunciation"
        score={nameFromDB.pronunciation}
        description={nameFromDB.pronunciationDescription}
        helpText="This score assesses the ease of pronouncing the name. Names that are easy to pronounce typically score higher."
      />
      <Score
        name="Spelling"
        score={nameFromDB.spelling}
        description={nameFromDB.spellingDescription}
        helpText="This score indicates how easy it is to spell the name correctly. Names that are simple and follow common spelling rules usually score higher."
      />
      <Score
        name="Positivity"
        score={nameFromDB.positivity}
        description={nameFromDB.positivityDescription}
        helpText="This score reflects the positive connotations associated with the name. Names that evoke positive emotions or meanings tend to score higher."
      />
      <Score
        name="Versatility"
        score={nameFromDB.versatility}
        description={nameFromDB.versatilityDescription}
        helpText="This score evaluates the adaptability of the name for different types of businesses or industries. A higher score indicates a more versatile name."
      />
    </div>
  )
}
