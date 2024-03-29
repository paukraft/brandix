import { getColorClass } from '@/lib/utils'

type Props = {
  value: number
  size?: 'small' | 'large'
}

export const CircularProgessbar = ({ value, size = 'large' }: Props) => {
  const colorClass = getColorClass({ value, as: 'text' })
  const strokeDashoffset = ((100 - value) / 100) * (2 * Math.PI * 45)
  const sizeClass = size === 'small' ? 'w-8 h-8' : 'w-28 h-28'
  const fontSizeClass = size === 'small' ? 'text-xs' : 'text-2xl font-semibold'

  return (
    <div className={`relative flex items-center justify-center ${sizeClass}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          className="text-gray-100 dark:text-zinc-800 stroke-current"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          className={`${colorClass} stroke-current duration-500`}
          strokeWidth="10"
          fill="none"
          strokeDasharray="282.74334"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-inherit ${fontSizeClass}`}>
        {value.toFixed()}
      </span>
    </div>
  )
}
