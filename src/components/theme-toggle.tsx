'use client'

import { RiMoonLine, RiSunLine } from '@remixicon/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-9 sm:size-10 rounded-xl hover:bg-accent/80 transition-all duration-200"
      >
        <RiSunLine />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      icon={theme === 'dark' ? RiSunLine : RiMoonLine}
      className="size-9 sm:size-10 rounded-xl hover:bg-accent/80 transition-all duration-200"
    />
  )
}
