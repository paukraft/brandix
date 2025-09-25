'use client'

import { NAME_STYLES } from '@/lib/generator-config'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocalStorage } from 'usehooks-ts'

type ChatUIContextValue = {
  isFavoritesOpen: boolean
  openFavorites: () => void
  closeFavorites: () => void
  registerClearHandler: (handler: () => void) => void
  triggerClear: () => void
  isClearDisabled: boolean
  setHasMessages: (has: boolean) => void
  setIsStreaming: (streaming: boolean) => void
  setIsGenerating: (generating: boolean) => void
  isStreaming: boolean
  isGenerating: boolean
  promptSuggestions: string[]
  setPromptSuggestions: (suggestions: string[]) => void
  clearPromptSuggestions: () => void
  registerScrollHandler: (handler: () => void) => void
  triggerScroll: () => void
  showOnlyAvailable: boolean
  toggleFilter: () => void
  isFilterDisabled: boolean
  nameStyles: (keyof typeof NAME_STYLES)[]
  setNameStyles: (styles: (keyof typeof NAME_STYLES)[]) => void
  toggleNameStyle: (style: keyof typeof NAME_STYLES) => void
  customPrompt: string
  setCustomPrompt: (value: string) => void
}

const ChatUIContext = createContext<ChatUIContextValue | null>(null)

const DEFAULT_PROMPT_SUGGESTIONS = [
  'AI startup name ideas',
  'Short fintech app names',
  'Open-source tool name ideas',
]

export const ChatUIProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const clearHandlerRef = useRef<null | (() => void)>(null)
  const scrollHandlerRef = useRef<null | (() => void)>(null)
  const [hasMessages, setHasMessages] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [nameStyles, setNameStyles] = useLocalStorage<
    (keyof typeof NAME_STYLES)[]
  >('brandix-name-styles', [])
  const [customPrompt, setCustomPrompt] = useLocalStorage<string>(
    'brandix-custom-prompt',
    ''
  )
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>(
    DEFAULT_PROMPT_SUGGESTIONS
  )

  const openFavorites = useCallback(() => setIsFavoritesOpen(true), [])
  const closeFavorites = useCallback(() => setIsFavoritesOpen(false), [])

  const clearPromptSuggestions = useCallback(() => {
    setPromptSuggestions([])
  }, [])

  const registerClearHandler = useCallback((handler: () => void) => {
    clearHandlerRef.current = handler
  }, [])

  const triggerClear = useCallback(() => {
    clearHandlerRef.current?.()
    setPromptSuggestions(DEFAULT_PROMPT_SUGGESTIONS)
  }, [])

  const registerScrollHandler = useCallback((handler: () => void) => {
    scrollHandlerRef.current = handler
  }, [])

  const triggerScroll = useCallback(() => {
    scrollHandlerRef.current?.()
  }, [])

  const toggleFilter = useCallback(() => {
    setShowOnlyAvailable((prev) => !prev)
  }, [])

  const toggleNameStyle = useCallback((style: keyof typeof NAME_STYLES) => {
    setNameStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    )
  }, [])

  const isClearDisabled = useMemo(
    () => !hasMessages || isGenerating,
    [hasMessages, isGenerating]
  )

  const isFilterDisabled = useMemo(
    () => !hasMessages || isGenerating,
    [hasMessages, isGenerating]
  )

  const value = useMemo(
    () => ({
      isFavoritesOpen,
      openFavorites,
      closeFavorites,
      registerClearHandler,
      triggerClear,
      isClearDisabled,
      setHasMessages,
      setIsStreaming,
      setIsGenerating,
      isStreaming,
      isGenerating,
      promptSuggestions,
      setPromptSuggestions,
      clearPromptSuggestions,
      registerScrollHandler,
      triggerScroll,
      showOnlyAvailable,
      toggleFilter,
      isFilterDisabled,
      nameStyles,
      setNameStyles,
      toggleNameStyle,
      customPrompt,
      setCustomPrompt,
    }),
    [
      isFavoritesOpen,
      openFavorites,
      closeFavorites,
      registerClearHandler,
      triggerClear,
      isClearDisabled,
      isStreaming,
      isGenerating,
      promptSuggestions,
      clearPromptSuggestions,
      registerScrollHandler,
      triggerScroll,
      showOnlyAvailable,
      toggleFilter,
      isFilterDisabled,
      nameStyles,
      setNameStyles,
      toggleNameStyle,
      customPrompt,
      setCustomPrompt,
    ]
  )

  return (
    <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>
  )
}

export const useChatUI = () => {
  const ctx = useContext(ChatUIContext)
  if (!ctx) throw new Error('useChatUI must be used within ChatUIProvider')
  return ctx
}

// Wrapper around the Vercel AI SDK useChat that centralizes streaming state in ChatUI
export const useChatWithUI = (options?: Parameters<typeof useChat>[0]) => {
  const {
    setHasMessages,
    setIsStreaming,
    setIsGenerating,
    nameStyles,
    customPrompt,
  } = useChatUI()

  const nameStylesRef = useRef(nameStyles)
  useEffect(() => {
    nameStylesRef.current = nameStyles
  }, [nameStyles])

  const customPromptRef = useRef(customPrompt)
  useEffect(() => {
    customPromptRef.current = customPrompt
  }, [customPrompt])

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        prepareSendMessagesRequest: ({ body, messages }) => {
          const selectedKeys = nameStylesRef.current
          const nameStyleDetails = Object.fromEntries(
            selectedKeys.map((k) => [k, NAME_STYLES[k]])
          )

          return {
            body: {
              ...(body || {}),
              messages,
              generatorSettings: {
                nameStyles: selectedKeys,
                nameStyleDetails,
                customPrompt: customPromptRef.current,
              },
            },
          }
        },
      }),
    []
  )

  const chat = useChat({
    ...options,
    // Send generator customization settings on every request
    transport,
  })

  const isStreaming = chat.status === 'streaming'
  const isGenerating =
    chat.status === 'submitted' || chat.status === 'streaming'

  // Sync ChatUI context with chat state
  useEffect(() => {
    setIsStreaming(isStreaming)
  }, [isStreaming, setIsStreaming])

  useEffect(() => {
    setIsGenerating(isGenerating)
  }, [isGenerating, setIsGenerating])

  useEffect(() => {
    setHasMessages(chat.messages.length > 0)
  }, [chat.messages.length, setHasMessages])

  return {
    ...chat,
    isStreaming,
    isGenerating,
  }
}
