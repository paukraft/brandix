export type BrandExample = {
  title: string
  description: string
}

type Props = {
  brandExample: BrandExample
  onClick: () => void
}

export const BrandExample = ({ brandExample, onClick }: Props) => {
  return (
    <button
      className="px-4 py-2 rounded-lg border border-input hover:bg-accent/20 flex flex-col"
      onClick={onClick}
    >
      <h3 className="font-mediuma">{brandExample.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {brandExample.description}
      </p>
    </button>
  )
}
