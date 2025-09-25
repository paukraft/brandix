'use client'

import { useChatUI } from '@/components/chat-ui'
import { SimpleTooltip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { NAME_STYLES } from '@/lib/generator-config'
import { cn } from '@/lib/utils'
import { RiCheckLine, RiEqualizer3Line } from '@remixicon/react'
import type { ReactNode } from 'react'

// Reusable framed section component inspired by analysis.tsx
const DoubleFrame = ({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) => {
  return (
    <div className={cn('border border-border', className)}>
      <div className="m-1 border border-border">
        {title && (
          <div className="border-b border-border bg-muted/30 px-3 py-2 font-mono text-xs sm:text-sm tracking-wider text-muted-foreground">
            <span>{title}</span>
          </div>
        )}
        <div className="p-3 sm:p-4">{children}</div>
      </div>
    </div>
  )
}

type NameStyleCard = {
  styleKey: keyof typeof NAME_STYLES
  isSelected: boolean
  onToggle: (style: keyof typeof NAME_STYLES) => void
}

const NameStyleCard = ({ styleKey, isSelected, onToggle }: NameStyleCard) => {
  const style = NAME_STYLES[styleKey]

  return (
    <button
      onClick={() => onToggle(styleKey)}
      className={cn(
        'group relative overflow-hidden border p-3 text-left transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-border/80 hover:bg-accent/30'
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'absolute top-2 right-2 flex size-4 items-center justify-center rounded-full border transition-all duration-200',
          isSelected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/50'
        )}
      >
        {isSelected && <RiCheckLine className="size-2.5" />}
      </div>

      <div className="space-y-2 pr-6">
        <div className="space-y-1">
          <h4 className="font-medium text-foreground text-sm">{style.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {style.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {style.examples.map((example) => (
            <span
              key={example}
              className={cn(
                'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono transition-colors',
                isSelected
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/60 text-muted-foreground group-hover:bg-muted'
              )}
            >
              {example}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

export const CustomizeGeneratorDialog = () => {
  const {
    nameStyles,
    toggleNameStyle,
    isGenerating,
    customPrompt,
    setCustomPrompt,
  } = useChatUI()
  const MAX_PROMPT_LEN = 500

  return (
    <Dialog>
      <DialogTrigger>
        <SimpleTooltip title="Customize Generator">
          <Button
            variant="ghost"
            size="icon"
            icon={RiEqualizer3Line}
            className="size-9 sm:size-10 rounded-xl hover:bg-accent/80 transition-all duration-200"
            aria-label="Customize generator"
          />
        </SimpleTooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <RiEqualizer3Line className="opacity-80" size={16} />
          </div>
          <div>
            <h1 className="text-left text-xl font-semibold">
              Customize Generator
            </h1>
            <p className="text-left text-sm text-muted-foreground">
              Configure naming styles and custom instructions for brand name
              generation
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Name Styles Selection */}
          <DoubleFrame title="STYLE SELECTION">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select the naming approaches you want the generator to focus
                  on. Multiple selections create more diverse results.
                </p>
                <div className="text-xs text-muted-foreground font-mono">
                  {nameStyles.length} active
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  Object.keys(NAME_STYLES) as Array<keyof typeof NAME_STYLES>
                ).map((styleKey) => (
                  <NameStyleCard
                    key={styleKey}
                    styleKey={styleKey}
                    isSelected={nameStyles.includes(styleKey)}
                    onToggle={toggleNameStyle}
                  />
                ))}
              </div>
            </div>
          </DoubleFrame>

          {/* Custom Instructions */}
          <DoubleFrame title="AI GUIDELINES">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Provide specific guidelines for the AI generator. Keep
                  instructions clear and actionable.
                </p>
                <span className="text-xs text-muted-foreground font-mono">
                  {customPrompt.length}/{MAX_PROMPT_LEN}
                </span>
              </div>
              <Textarea
                placeholder="e.g., Prefer short, memorable names under 10 characters; avoid complex spellings; prioritize .com availability; focus on tech-friendly terms"
                value={customPrompt}
                onChange={(e) =>
                  setCustomPrompt(e.target.value.slice(0, MAX_PROMPT_LEN))
                }
                maxLength={MAX_PROMPT_LEN}
                disabled={isGenerating}
                className="resize-none min-h-[80px] font-mono text-sm"
                aria-label="Custom prompt"
              />
              {customPrompt.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  ✓ Custom instructions active
                </div>
              )}
            </div>
          </DoubleFrame>
        </div>
      </DialogContent>
    </Dialog>
  )
}
