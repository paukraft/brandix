import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getColorClass = ({
  value,
  as = 'bg',
}: {
  value: number
  as?: 'text' | 'bg'
}) => {
  if (value < 50)
    return as === 'text'
      ? 'text-red-500 dark:text-red-600'
      : 'bg-red-500 dark:bg-red-600'
  if (value < 75)
    return as === 'text'
      ? 'text-amber-500 dark:text-amber-600'
      : 'bg-amber-500 dark:bg-amber-600'
  return as === 'text'
    ? 'text-green-500 dark:text-green-600'
    : 'bg-green-500 dark:bg-green-600'
}

export const shareOrCopy = ({
  title,
  url,
  copySuccessMessage,
}: {
  title?: string
  url: string
  copySuccessMessage?: string
}) => {
  if (navigator.share) {
    navigator.share({
      title,
      url,
    })
  } else {
    navigator.clipboard.writeText(url)
    return copySuccessMessage
  }
}
