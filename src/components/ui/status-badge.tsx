'use client'

import { cn } from '@/lib/utils'
import {
  RiCheckLine,
  RiCloseLine,
  RiLoader2Line,
  RiQuestionLine,
} from '@remixicon/react'

type DomainAvailability = 'available' | 'taken' | 'unknown'
type Confidence = 'high' | 'medium' | 'low'

type StatusBadgeProps = {
  availability?: DomainAvailability
  confidence?: Confidence
  isLoading?: boolean
  className?: string
  href?: string
  onClick?: () => void
}

const getAvailabilityConfig = (availability: DomainAvailability) => {
  switch (availability) {
    case 'available':
      return {
        badge:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      }
    case 'taken':
      return {
        badge:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
      }
    default:
      return {
        badge:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      }
  }
}

export const StatusBadge = ({
  availability,
  confidence,
  isLoading = false,
  className,
  href,
  onClick,
}: StatusBadgeProps) => {
  const baseClassName = cn(
    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
    className
  )

  const getStatusContent = () => {
    if (isLoading) {
      return {
        icon: RiLoader2Line,
        text: 'Checking',
        iconClassName: 'animate-spin',
      }
    }

    if (!availability) return null

    const getText = () => {
      const prefix = confidence !== 'high' ? 'Probably ' : ''
      switch (availability) {
        case 'available':
          return `${prefix}Available`
        case 'taken':
          return `${prefix}Taken`
        default:
          return 'Unknown'
      }
    }

    const getIcon = () => {
      switch (availability) {
        case 'available':
          return RiCheckLine
        case 'taken':
          return RiCloseLine
        default:
          return RiQuestionLine
      }
    }

    return {
      icon: getIcon(),
      text: getText(),
      iconClassName: '',
    }
  }

  const statusContent = getStatusContent()

  const content = statusContent ? (
    <>
      <statusContent.icon
        className={cn('size-3', statusContent.iconClassName)}
      />
      {statusContent.text}
    </>
  ) : null

  const badgeClassName = cn(
    baseClassName,
    isLoading
      ? 'border-border bg-muted/50'
      : availability
      ? getAvailabilityConfig(availability).badge
      : ''
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={badgeClassName}
        onClick={onClick}
      >
        {content}
      </a>
    )
  }

  if (onClick) {
    return (
      <button className={badgeClassName} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={badgeClassName}>{content}</div>
}
