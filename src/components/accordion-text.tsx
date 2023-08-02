'use client'

import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'

const AccordionText = React.forwardRef<
  React.ElementRef<'div'>,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn('flex flex-col items-center gap-2')}>
      <div
        className={cn(
          'overflow-hidden text-sm w-full',
          isExpanded ? 'line-clamp-none' : `line-clamp-2 cursor-pointer`,
          className
        )}
        onClick={() => !isExpanded && setIsExpanded(!isExpanded)}
        {...props}
        ref={ref}
      >
        {children}
      </div>
      <button
        className="flex gap-1 items-center text-xs"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronUp className="h-[1em] w-[1em]" />
        ) : (
          <ChevronDown className="h-[1em] w-[1em]" />
        )}
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  )
})
AccordionText.displayName = 'AccordionText'

export { AccordionText }
