import { type PropsWithChildren, type ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

export const SimpleTooltip = ({
  title,
  children,
}: PropsWithChildren<{ title: ReactNode }>) => {
  if (!title) return <>{children}</>
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipContent>{title}</TooltipContent>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}
