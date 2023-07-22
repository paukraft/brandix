'use client'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Progressbar } from '@/components/ui/progressbar'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronRight } from 'lucide-react'

export const Score = async ({
  name,
  score,
  description,
  helpText,
}: {
  name: string
  score: number
  description: string
  helpText?: string
}) => {
  return (
    <AccordionPrimitive.Root type="single" collapsible>
      <AccordionPrimitive.Item value={name} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <AccordionPrimitive.Trigger className="w-full flex justify-start items-center gap-1 text-xl [&[data-state=open]>svg]:rotate-90">
            <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200" />
            <div className="flex items-center gap-3">
              <span className="font-medium tracking-tighter">{name}</span>
              {helpText && (
                <HoverCard openDelay={200}>
                  <HoverCardTrigger>
                    <div className="h-4 w-4 text-xs rounded-full bg-slate-100 dark:bg-slate-700">
                      ?
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="text-base font-semibold">{name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {helpText}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <span className="font-semibold tracking-tighter flex-1 text-right">
              {score}
            </span>
          </AccordionPrimitive.Trigger>
          <AccordionPrimitive.Trigger>
            <Progressbar value={score} size="small" />
          </AccordionPrimitive.Trigger>
        </div>
        <AccordionPrimitive.Content className="rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="p-3">
            <span>{description}</span>
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
    // <Card className="w-full flex flex-col items-center gap-2">
    //   <span className="text-white text-lg">{name}</span>
    //   <CircularProgessbar value={score} />
    // </Card>
  )
}
