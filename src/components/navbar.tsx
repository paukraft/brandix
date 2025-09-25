'use client'

import { useChatUI } from '@/components/chat-ui'
import { CustomizeGeneratorDialog } from '@/components/customize-generator-dialog'
import { SimpleTooltip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  RiDeleteBin6Line,
  RiFilterLine,
  RiFilterOffLine,
  RiStarLine,
} from '@remixicon/react'
import Link from 'next/link'
import Logo from './logo'
import { ThemeToggle } from './theme-toggle'

export const Navbar = () => {
  const {
    openFavorites,
    triggerClear,
    isClearDisabled,
    showOnlyAvailable,
    toggleFilter,
    isFilterDisabled,
    isGenerating,
  } = useChatUI()

  return (
    <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex flex-nowrap items-center gap-2 sm:gap-6 px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-popover/95 backdrop-blur-xl border border-input rounded-3xl shadow-xs relative max-w-[calc(100vw-1rem)] sm:max-w-none whitespace-nowrap">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-100% to-muted/20 rounded-3xl pointer-events-none" />
        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-all duration-200 group relative z-10"
        >
          <div className="relative">
            <Logo className="size-8" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-lg font-bold text-foreground tracking-tight">
              Brandix
            </span>
            <span className="text-xs text-muted-foreground font-medium -mt-1">
              AI Brand Studio
            </span>
          </div>
        </Link>

        <div
          className="hidden sm:block mx-2 h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent relative z-10"
          aria-hidden="true"
        />

        {/* Chat Controls */}
        <div className="flex items-center gap-2 relative z-10">
          <SimpleTooltip title="Favorites">
            <Button
              variant="ghost"
              size="icon"
              icon={RiStarLine}
              onClick={openFavorites}
              disabled={isGenerating}
              className="size-9 sm:size-10 rounded-full hover:bg-accent transition-all duration-200"
              aria-label="Open favorites"
            />
          </SimpleTooltip>

          <CustomizeGeneratorDialog />

          <SimpleTooltip
            title={
              showOnlyAvailable
                ? 'Show all suggestions'
                : 'Only show available domains'
            }
          >
            <Button
              variant="ghost"
              size="icon"
              icon={showOnlyAvailable ? RiFilterOffLine : RiFilterLine}
              onClick={toggleFilter}
              disabled={isFilterDisabled}
              className={cn(
                'size-9 sm:size-10 rounded-full hover:bg-accent transition-all duration-200',
                showOnlyAvailable &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              aria-label={
                showOnlyAvailable
                  ? 'Show all suggestions'
                  : 'Only show available domains'
              }
            />
          </SimpleTooltip>

          <SimpleTooltip title="Clear conversation">
            <Button
              variant="ghost"
              size="icon"
              icon={RiDeleteBin6Line}
              onClick={triggerClear}
              className={cn(
                'size-9 sm:size-10 rounded-full hover:bg-accent transition-all duration-200',
                isClearDisabled && 'opacity-50'
              )}
              disabled={isClearDisabled}
              aria-label="Clear conversation"
            />
          </SimpleTooltip>
        </div>

        <div
          className="hidden sm:block mx-2 h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent relative z-10"
          aria-hidden="true"
        />

        {/* Utility Controls */}
        <div className="flex items-center relative z-10">
          <div className="size-9 sm:size-10 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
