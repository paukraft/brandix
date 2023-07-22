import { getColorClass } from '@/lib/utils'

interface Props {
  value: number
  size?: 'small' | 'large'
}

export const Progressbar: React.FC<Props> = ({ value, size = 'large' }) => {
  const colorClass = getColorClass({ value })
  const width = `${value}%`
  const sizeClass = size === 'small' ? 'h-2' : 'h-4'

  return (
    <div
      className={`relative w-full bg-gray-100 dark:bg-zinc-800 rounded-full ${sizeClass}`}
    >
      <div
        className={`absolute top-0 left-0 h-full rounded-full ${colorClass}`}
        style={{ width }}
      />
    </div>
  )
}
