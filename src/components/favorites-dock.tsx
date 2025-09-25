'use client'

import { SimpleTooltip } from '@/components/simple-tooltip'
import { Suggestion } from '@/components/suggestion'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/lib/use-favorites'
import { cn } from '@/lib/utils'
import {
  RiCloseLine,
  RiSearchLine,
  RiStarFill,
  RiStarLine,
} from '@remixicon/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Drawer } from 'vaul'

// Thanos snap animation component
const ThanosSnapAnimation = ({
  children,
  isRemoving,
  onAnimationComplete,
}: {
  children: React.ReactNode
  isRemoving: boolean
  onAnimationComplete: () => void
}) => {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([])

  const generateParticles = useCallback(() => {
    const particleCount = 15
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.3,
    }))
    setParticles(newParticles)
  }, [])

  useEffect(() => {
    if (isRemoving) {
      generateParticles()
    }
  }, [isRemoving, generateParticles])

  if (!isRemoving) {
    return <>{children}</>
  }

  return (
    <div className="relative overflow-hidden">
      {/* Original content with dissolve effect */}
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{
          opacity: [1, 0.8, 0.5, 0],
          scale: [1, 1.02, 0.98, 0.95],
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        onAnimationComplete={onAnimationComplete}
      >
        {children}
      </motion.div>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-muted-foreground/40 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{
              opacity: 0,
              scale: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 0.8, 0],
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100 + Math.random() * 50],
            }}
            transition={{
              duration: 1.2,
              delay: particle.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        ))}
      </div>
    </div>
  )
}

export const FavoritesDock = ({
  isOpen,
  onClose,
  sendMessage,
}: {
  isOpen: boolean
  onClose: () => void
  sendMessage: ({ text }: { text: string }) => void
}) => {
  const [query, setQuery] = useState('')
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [previousFavorites, setPreviousFavorites] = useState<typeof favorites>(
    []
  )
  const searchRef = useRef<HTMLInputElement | null>(null)
  const { favorites } = useFavorites()

  const handleRemoveAnimation = useCallback((suggestionKey: string) => {
    setRemovingItems((prev) => new Set([...prev, suggestionKey]))
  }, [])

  const handleAnimationComplete = useCallback((suggestionKey: string) => {
    setRemovingItems((prev) => {
      const next = new Set(prev)
      next.delete(suggestionKey)
      return next
    })
  }, [])

  // Detect when favorites are removed and trigger animation
  useEffect(() => {
    const createKey = (s: { domain: string; name: string }) =>
      `${s.domain}::${s.name}`
    const currentKeys = new Set(favorites.map(createKey))
    const previousKeys = new Set(previousFavorites.map(createKey))

    // Find removed items
    const removedKeys = Array.from(previousKeys).filter(
      (key) => !currentKeys.has(key)
    )

    if (removedKeys.length > 0) {
      setRemovingItems((prev) => new Set([...prev, ...removedKeys]))
    }

    setPreviousFavorites(favorites)
  }, [favorites, previousFavorites])

  useEffect(() => {
    if (!isOpen) return
    const id = window.setTimeout(() => {
      searchRef.current?.focus()
    }, 150)
    return () => window.clearTimeout(id)
  }, [isOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setQuery('')
        if (isOpen) searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return favorites
    return favorites.filter((s) =>
      [s.name, s.domain].some((v) => (v || '').toLowerCase().includes(q))
    )
  }, [favorites, query])

  return (
    <Drawer.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto w-full rounded-t-2xl border bg-popover text-popover-foreground shadow-lg'
          )}
          aria-labelledby="favorites-title"
        >
          <div className="mx-auto w-full max-w-3xl">
            {/* Handle bar (mobile) */}
            <div className="flex items-center justify-center pt-2">
              <div className="h-1.5 w-10 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex size-8 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <RiStarFill className="opacity-80" />
                </div>
                <div className="min-w-0">
                  <Drawer.Title
                    id="favorites-title"
                    className="text-base font-semibold leading-none"
                  >
                    Favorites
                  </Drawer.Title>
                  <Drawer.Description className="text-muted-foreground text-xs mt-0.5 truncate">
                    Quick actions for your saved names
                  </Drawer.Description>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <SimpleTooltip title="Close">
                  <Drawer.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={RiCloseLine}
                      onClick={onClose}
                      className="rounded-full"
                    />
                  </Drawer.Close>
                </SimpleTooltip>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-2">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search favorites…"
                  className="w-full rounded-lg border bg-background/60 px-9 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={RiCloseLine}
                    onClick={() => setQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8"
                    aria-label="Clear search"
                  />
                )}
              </div>
            </div>

            {/* Content list */}
            <div className="max-h-[65svh] overflow-y-auto px-4 pb-3">
              {filtered.length === 0 ? (
                <div className="my-2 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
                  <RiStarLine className="size-6 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No favorites yet</p>
                    <p className="text-xs text-muted-foreground">
                      Tap the star on a suggestion to save it here.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((s) => {
                      const suggestionKey = `${s.domain}::${s.name}`
                      const isRemoving = removingItems.has(suggestionKey)

                      return (
                        <motion.li
                          key={suggestionKey}
                          layout
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                        >
                          <ThanosSnapAnimation
                            isRemoving={isRemoving}
                            onAnimationComplete={() =>
                              handleAnimationComplete(suggestionKey)
                            }
                          >
                            <Suggestion
                              suggestion={s}
                              sendMessage={sendMessage}
                            />
                          </ThanosSnapAnimation>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
