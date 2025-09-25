'use client'
import { CopyButton } from '@/components/ui/copy-button'
import { SuggestionType } from '@/lib/schemas'
import { useFavorites } from '@/lib/use-favorites'
import { cn } from '@/lib/utils'
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiExchangeLine,
  RiGitBranchLine,
  RiLoader2Line,
  RiNewspaperLine,
  RiQuestionLine,
  RiScissorsLine,
  RiSearchLine,
  RiStarFill,
  RiStarLine,
  RiText,
} from '@remixicon/react'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStickToBottomContext } from 'use-stick-to-bottom'
import { useChatUI } from './chat-ui'
import { SimpleTooltip } from './simple-tooltip'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type DomainLookupResult = {
  domain: string
  availability: 'available' | 'taken' | 'unknown'
  confidence: 'high' | 'medium' | 'low'
  checks: {
    dns: {
      hasRecords: boolean
      aCount: number
      aaaaCount: number
      cnameCount: number
      mxCount: number
      nsCount: number
      txtCount: number
      hasSoa: boolean
    }
    whois: {
      server: string | null
      result: 'available' | 'taken' | 'unknown'
      raw: string
    }
  }
}

type CachedResult = {
  data: DomainLookupResult
  timestamp: number
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const CACHE_KEY_PREFIX = 'domain-lookup-'

const getCachedResult = (key: string): DomainLookupResult | null => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key)
    if (!cached) return null

    const { data, timestamp }: CachedResult = JSON.parse(cached)
    const now = Date.now()

    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key)
      return null
    }

    return data
  } catch {
    return null
  }
}

const setCachedResult = (key: string, data: DomainLookupResult): void => {
  if (typeof window === 'undefined') return

  try {
    const cachedResult: CachedResult = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cachedResult))
  } catch {
    // localStorage might be full or unavailable, silently fail
  }
}

export const Suggestion = ({
  suggestion,
  sendMessage,
  showOnlyAvailable,
}: {
  suggestion: SuggestionType
  sendMessage: ({ text }: { text: string }) => void
  showOnlyAvailable?: boolean
}) => {
  const { scrollToBottom } = useStickToBottomContext()
  const { setPromptSuggestions, isGenerating } = useChatUI()
  const [lookupCallCount, setLookupCallCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DomainLookupResult | null>(null)
  const inFlightKeysRef = useRef<Set<string>>(new Set())
  const completedKeysRef = useRef<Set<string>>(new Set())
  const resultsCacheRef = useRef<Map<string, DomainLookupResult>>(new Map())
  const activeKeyRef = useRef<string | null>(null)
  const { isFavorited, toggleFavorite } = useFavorites()

  const getSuggestionKey = ({ domain, name }: SuggestionType) =>
    `${domain ?? ''}::${name ?? ''}`

  const domain = suggestion.domain || ''
  const name = suggestion.name || ''

  const handleAnalyze = useCallback(() => {
    scrollToBottom()
    sendMessage({
      text: `Please analyze the name "${name}"`,
    })
  }, [scrollToBottom, sendMessage, name])

  const expensiveLookup = useCallback(
    async ({ suggestion }: { suggestion: SuggestionType }) => {
      const key = getSuggestionKey(suggestion)
      if (completedKeysRef.current.has(key) || inFlightKeysRef.current.has(key))
        return

      inFlightKeysRef.current.add(key)
      try {
        setLookupCallCount((prev) => prev + 1)

        const domain = suggestion.domain?.trim() ?? ''
        let safeData: DomainLookupResult | null = null

        try {
          const res = await fetch(
            `/api/domain-lookup?domain=${encodeURIComponent(domain)}`
          )
          if (res.ok) {
            safeData = (await res.json()) as DomainLookupResult
          }
        } catch {
          // network error -> leave safeData null
        }

        if (!safeData) {
          safeData = {
            domain,
            availability: 'unknown',
            confidence: 'low',
            checks: {
              dns: {
                hasRecords: false,
                aCount: 0,
                aaaaCount: 0,
                cnameCount: 0,
                mxCount: 0,
                nsCount: 0,
                txtCount: 0,
                hasSoa: false,
              },
              whois: { server: null, result: 'unknown', raw: '' },
            },
          }
        }

        resultsCacheRef.current.set(key, safeData)
        completedKeysRef.current.add(key)
        setCachedResult(key, safeData)

        if (activeKeyRef.current === key) setResult(safeData)
      } finally {
        inFlightKeysRef.current.delete(key)
        if (activeKeyRef.current === key) setIsLoading(false)
      }
    },
    []
  )

  const debouncedLookup = useMemo(
    () => debounce(expensiveLookup, 1000, { leading: false, trailing: true }),
    [expensiveLookup]
  )

  useEffect(() => {
    const domain = suggestion?.domain?.trim()

    // Only trigger when domain looks complete and stable
    // Basic heuristic: has a dot and at least 2 chars after it
    const isLikelyCompleteDomain =
      !!domain && /\.[a-zA-Z0-9-]{2,}$/.test(domain)

    if (!isLikelyCompleteDomain) {
      debouncedLookup.cancel()
      setIsLoading(false)
      setResult(null)
      return () => {
        debouncedLookup.cancel()
      }
    }

    const normalized = { ...suggestion, domain }
    const key = getSuggestionKey(normalized)
    activeKeyRef.current = key

    // Check memory cache first
    let cached = resultsCacheRef.current.get(key)

    // If not in memory, check localStorage
    if (!cached) {
      const localStorageResult = getCachedResult(key)
      if (localStorageResult) {
        cached = localStorageResult
        // Add to memory cache for faster subsequent access
        resultsCacheRef.current.set(key, cached)
        completedKeysRef.current.add(key)
      }
    }

    if (cached) {
      setResult(cached)
      setIsLoading(false)
      debouncedLookup.cancel()
      return () => {
        debouncedLookup.cancel()
      }
    }
    if (completedKeysRef.current.has(key) || inFlightKeysRef.current.has(key)) {
      setIsLoading(true)
      debouncedLookup.cancel() // already in-flight or done; avoid duplicate trailing call
      return () => {
        debouncedLookup.cancel()
      }
    }

    setIsLoading(true)
    debouncedLookup({ suggestion: normalized })

    return () => {
      debouncedLookup.cancel()
    }
  }, [suggestion, debouncedLookup])

  const domainrUrl = `https://domainr.com/?q=${encodeURIComponent(domain)}`
  const domainUrl = `https://${domain}`
  const normalizedSuggestion = useMemo(
    () => ({ domain: domain.trim(), name }),
    [domain, name]
  )
  const favorited = isFavorited(normalizedSuggestion)

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(normalizedSuggestion)
  }, [toggleFavorite, normalizedSuggestion])

  // Hide suggestion if filter is enabled and domain is not available
  if (showOnlyAvailable && result && result.availability !== 'available') {
    return null
  }

  // Also hide if filter is enabled but we're still loading (to avoid flickering)
  if (showOnlyAvailable && isLoading && !result) {
    return null
  }

  return (
    <div className="group/suggestion relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-300 p-4 sm:p-3.5">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-2">
          {/* Name Section */}
          <div className="flex items-start gap-2.5">
            <h3 className="font-semibold text-foreground text-xl leading-tight truncate mb-1 min-w-0">
              {name}
            </h3>
            {name && (
              <CopyButton
                text={name}
                className="opacity-0 group-hover/suggestion:opacity-70 hover:opacity-100 transition-all duration-200 size-5 sm:size-4 shrink-0 hover:scale-110 mt-0.5"
              />
            )}
          </div>

          {/* Domain Section with Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* Domain Badge with Status */}
              <div
                className={cn(
                  'text-xs font-mono transition-all duration-200 min-w-0 px-2 py-1 rounded border flex items-center gap-1.5',
                  // Base styles
                  'hover:shadow-sm',
                  // Status-based styling
                  isLoading
                    ? 'bg-muted/30 border-border/50 text-muted-foreground animate-pulse'
                    : result?.availability === 'available'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/15'
                    : result?.availability === 'taken'
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/15'
                    : result?.availability === 'unknown'
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/15'
                    : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50'
                )}
              >
                {/* Status Icon with Tooltip */}
                {isLoading ? (
                  <SimpleTooltip title="Checking domain availability...">
                    <RiLoader2Line className="size-2.5 animate-spin shrink-0" />
                  </SimpleTooltip>
                ) : result?.availability === 'available' ? (
                  <SimpleTooltip
                    title={`${
                      result.confidence !== 'high' ? 'Probably ' : ''
                    }Available`}
                  >
                    <RiCheckLine className="size-2.5 shrink-0" />
                  </SimpleTooltip>
                ) : result?.availability === 'taken' ? (
                  <SimpleTooltip
                    title={`${
                      result.confidence !== 'high' ? 'Probably ' : ''
                    }Taken`}
                  >
                    <RiCloseLine className="size-2.5 shrink-0" />
                  </SimpleTooltip>
                ) : result?.availability === 'unknown' ? (
                  <SimpleTooltip title="Availability unknown">
                    <RiQuestionLine className="size-2.5 shrink-0" />
                  </SimpleTooltip>
                ) : null}

                {/* Domain Link */}
                <a
                  href={domainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 hover:underline underline-offset-2 transition-all duration-200 truncate"
                  title={`Visit ${domain}`}
                >
                  <span className="opacity-60">https://</span>
                  <span className="truncate">{domain}</span>
                </a>
              </div>

              {/* Domainr Check Button */}
              <SimpleTooltip title="Check availability on Domainr">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => window.open(domainrUrl, '_blank')}
                  className="opacity-0 group-hover/suggestion:opacity-70 hover:opacity-100 size-6 hover:scale-105 transition-all duration-200"
                >
                  <RiSearchLine className="size-3" />
                </Button>
              </SimpleTooltip>

              {/* Copy Button */}
              {domain && (
                <CopyButton
                  text={domain}
                  className="opacity-0 group-hover/suggestion:opacity-70 hover:opacity-100 transition-all duration-200 size-4 hover:scale-110"
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-start justify-end gap-1">
          {/* Favorite Button */}
          <SimpleTooltip
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleFavorite}
              icon={favorited ? RiStarFill : RiStarLine}
              aria-pressed={favorited}
              disabled={isGenerating}
              className={cn(
                'size-9 hover:scale-105 transition-all duration-200 opacity-60 hover:opacity-100',
                favorited && 'text-primary opacity-100'
              )}
            />
          </SimpleTooltip>

          {/* Iterate Dropdown */}
          <DropdownMenu>
            <SimpleTooltip title="Iterate on this name">
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isGenerating}
                  icon={RiGitBranchLine}
                  className="size-9 hover:scale-105 transition-all duration-200 opacity-60 hover:opacity-100"
                />
              </DropdownMenuTrigger>
            </SimpleTooltip>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  sendMessage({
                    text: `Please generate variations of "${name}" with similar meaning and style`,
                  })
                  setPromptSuggestions([
                    `More variations of "${name}"`,
                    `Different style variations of "${name}"`,
                    `Make "${name}" more unique`,
                  ])
                }}
              >
                <RiGitBranchLine className="size-4 mr-2" />
                Generate similar names
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  sendMessage({
                    text: `Please shorten "${name}" to make it more concise while keeping the core meaning`,
                  })
                  setPromptSuggestions([
                    `Even shorter versions of "${name}"`,
                    `Make "${name}" ultra-concise`,
                    `Single word versions of "${name}"`,
                  ])
                }}
              >
                <RiScissorsLine className="size-4 mr-2" />
                Shorten this name
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  sendMessage({
                    text: `Please add prefixes or suffixes to "${name}" to create extended variations`,
                  })
                  setPromptSuggestions([
                    `Try different prefixes for "${name}"`,
                    `Try different suffixes for "${name}"`,
                    `Make "${name}" sound more professional`,
                  ])
                }}
              >
                <RiAddLine className="size-4 mr-2" />
                Add prefix or suffix
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  sendMessage({
                    text: `Please replace words in "${name}" with synonyms or related terms`,
                  })
                  setPromptSuggestions([
                    `Try more synonyms for "${name}"`,
                    `Replace with stronger words in "${name}"`,
                    `Make "${name}" more impactful`,
                  ])
                }}
              >
                <RiExchangeLine className="size-4 mr-2" />
                Replace with synonyms
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  sendMessage({
                    text: `Please rearrange or restructure the words in "${name}" in different ways`,
                  })
                  setPromptSuggestions([
                    `Try different word orders for "${name}"`,
                    `Restructure "${name}" completely`,
                    `Make "${name}" flow better`,
                  ])
                }}
              >
                <RiText className="size-4 mr-2" />
                Rearrange words
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Analyze Button */}
          <SimpleTooltip title="Analyze this name">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAnalyze}
              icon={RiNewspaperLine}
              disabled={isGenerating}
              className="size-9 hover:scale-105 transition-all duration-200 opacity-60 hover:opacity-100"
            />
          </SimpleTooltip>
        </div>
      </div>
    </div>
  )
}
