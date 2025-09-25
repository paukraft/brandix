'use client'

import { Analysis } from '@/components/analysis'
import { useChatUI, useChatWithUI } from '@/components/chat-ui'
import { FavoritesDock } from '@/components/favorites-dock'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/reasoning'
import { Response } from '@/components/response'
import { SimpleTooltip } from '@/components/simple-tooltip'
import { Suggestion } from '@/components/suggestion'
import { Button } from '@/components/ui/button'
import {
  ChatContainerContent,
  ChatContainerRoot,
} from '@/components/ui/chat-container'
import { Message, MessageContent } from '@/components/ui/message'
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/ui/prompt-input'
import { ScrollButton } from '@/components/ui/scroll-button'
import { AnalysisCriteriaType, SuggestionType } from '@/lib/schemas'
import { cn } from '@/lib/utils'
// useChat is wrapped by useChatWithUI
import { RiAddLine, RiArrowUpLine, RiLoader2Line } from '@remixicon/react'
import { memo, useCallback, useEffect, useState } from 'react'
import { useStickToBottomContext } from 'use-stick-to-bottom'

type MessageComponentProps = {
  message: any
  isLastMessage: boolean
  sendMessage: ({ text }: { text: string }) => void
  showOnlyAvailable: boolean
  isStreaming: boolean
}

const SHOW_REASONING_TEXTS = false
const SHOW_REASONING_INDICATOR = true

const MessageComponent = memo(
  ({
    message,
    isLastMessage,
    sendMessage,
    showOnlyAvailable,
    isStreaming,
  }: MessageComponentProps) => {
    const isAssistant = message.role === 'assistant'
    const hasTextPart =
      Array.isArray(message.parts) &&
      message.parts.some((p: { type: string }) => p.type === 'text')

    return (
      <Message
        className={cn(
          'mx-auto flex w-full max-w-3xl gap-3 px-2 md:px-10',
          isAssistant ? 'items-start' : 'items-end flex-col'
        )}
      >
        {isAssistant ? (
          <>
            {/* <MessageAvatar
              src={logo.src}
              alt="Brandix"
              fallback="AI"
              className="mt-1 rounded-md"
            /> */}
            <div className="group flex w-full flex-col gap-0">
              <div className="text-foreground prose w-full min-w-0 flex-1 rounded-lg bg-transparent p-0">
                {message.parts.map((part: any, i: number) => {
                  switch (part.type) {
                    case 'text':
                      return <Response key={`text-${i}`}>{part.text}</Response>
                    case 'tool-displaySuggestions':
                      if (part.input && 'domains') {
                        const domains =
                          (part.input as { domains?: SuggestionType[] })
                            .domains || []
                        return (
                          <div
                            key={`suggestions-${i}`}
                            className="my-4 space-y-4"
                          >
                            {domains.map((suggestion) => (
                              <Suggestion
                                key={suggestion.domain + i}
                                suggestion={suggestion}
                                sendMessage={sendMessage}
                                showOnlyAvailable={showOnlyAvailable}
                              />
                            ))}
                          </div>
                        )
                      }
                      return null
                    case 'tool-displayAnalysis':
                      if (part.input && 'analysis') {
                        const analysis = part.input as AnalysisCriteriaType
                        return (
                          <div key={`analysis-${i}`} className="my-4">
                            <Analysis analysis={analysis} />
                          </div>
                        )
                      }
                      return null
                    case 'reasoning':
                      // If SHOW_REASONING_TEXTS is true, use normal reasoning UI
                      if (SHOW_REASONING_TEXTS) {
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={isStreaming}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        )
                      }

                      // If SHOW_REASONING_TEXTS is false, show a minimal indicator ONLY while thinking
                      if (
                        SHOW_REASONING_INDICATOR &&
                        isLastMessage &&
                        isStreaming &&
                        !hasTextPart
                      ) {
                        return (
                          <div
                            key={`thinking-${i}`}
                            className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            <RiLoader2Line className="size-3 animate-spin" />
                            <span>Thinking…</span>
                          </div>
                        )
                      }

                      // Otherwise, show nothing
                      return null

                    default:
                      return null
                  }
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="group flex w-full flex-col items-end gap-1">
            <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 whitespace-pre-wrap sm:max-w-[75%]">
              {message.parts
                .map((part: any) => (part.type === 'text' ? part.text : null))
                .join('')}
            </MessageContent>
          </div>
        )}
      </Message>
    )
  }
)

MessageComponent.displayName = 'MessageComponent'

const ScrollHandler = () => {
  const { scrollToBottom } = useStickToBottomContext()
  const { registerScrollHandler } = useChatUI()

  useEffect(() => {
    registerScrollHandler(scrollToBottom)
  }, [registerScrollHandler, scrollToBottom])

  return null
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Brandix',
  description:
    'AI-powered brand naming that captures your vision. Generate distinctive, memorable, and pronounceable names for your ideas, projects, startups, and companies with real-time domain availability checking.',
  url: 'https://brandix.ai',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: 'Brandix',
  },
  featureList: [
    'AI-powered brand name generation',
    'Real-time domain availability checking',
    'Brand name analysis and scoring',
    'Multiple naming styles and approaches',
    'Instant suggestions and feedback',
  ],
}

export default function Chat() {
  const [input, setInput] = useState('')
  const {
    messages,
    sendMessage: sendMessageCore,
    setMessages,
    status: chatStatus,
    isStreaming: sdkIsStreaming,
    isGenerating,
  } = useChatWithUI()
  const {
    isFavoritesOpen,
    closeFavorites,
    registerClearHandler,
    setHasMessages,
    setIsStreaming,
    promptSuggestions,
    clearPromptSuggestions,
    registerScrollHandler,
    triggerScroll,
    showOnlyAvailable,
  } = useChatUI()

  // Wrapper function that clears suggestions and sends message
  const sendMessage = useCallback(
    ({ text }: { text: string }) => {
      clearPromptSuggestions()
      triggerScroll()
      sendMessageCore({ text })
    },
    [clearPromptSuggestions, triggerScroll, sendMessageCore]
  )

  // Register clear chat handler
  useEffect(() => {
    registerClearHandler(() => setMessages([]))
  }, [registerClearHandler, setMessages])

  // Sync chat state to navbar controls
  useEffect(() => {
    setHasMessages(messages.length > 0)
  }, [messages.length, setHasMessages])

  // Sync streaming state to context happens inside useChatWithUI

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex h-screen flex-col overflow-hidden justify-center relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 size-96 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 size-80 bg-gradient-to-tl from-primary/4 via-primary/2 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-gradient-to-r from-transparent via-primary/2 to-transparent rounded-full blur-2xl opacity-50" />
        </div>

        <ChatContainerRoot
          className={cn(
            'relative flex-1 space-y-0 overflow-y-auto',
            messages.length === 0 && 'hidden'
          )}
        >
          <FavoritesDock
            isOpen={isFavoritesOpen}
            onClose={closeFavorites}
            sendMessage={sendMessage}
          />
          <ChatContainerContent className="space-y-12 px-4 py-12 leading-relaxed">
            <ScrollHandler />
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1
              const isFirstMessage = index === 0

              return (
                <>
                  {isFirstMessage && <div className="h-8" />}
                  <MessageComponent
                    key={message.id}
                    message={message}
                    isLastMessage={isLastMessage}
                    sendMessage={sendMessage}
                    showOnlyAvailable={showOnlyAvailable}
                    isStreaming={sdkIsStreaming}
                  />
                </>
              )
            })}
            {messages.length > 0 && !isGenerating && !sdkIsStreaming && (
              <div className="flex justify-center pt-4">
                <SimpleTooltip title="Generate more">
                  <Button
                    variant="outline"
                    icon={RiAddLine}
                    onClick={() => {
                      sendMessage({ text: 'Please generate more' })
                    }}
                    className="rounded-full"
                  >
                    Generate more
                  </Button>
                </SimpleTooltip>
              </div>
            )}
          </ChatContainerContent>

          {/* Scroll to bottom button */}
          {messages.length > 0 && (
            <div className="fixed bottom-36 right-4 z-20 md:bottom-24 md:right-6">
              <ScrollButton />
            </div>
          )}
        </ChatContainerRoot>

        <div
          className={cn(
            'w-full max-w-3xl mx-auto text-center px-4 pb-14 flex flex-col justify-center',
            messages.length > 0 && 'hidden'
          )}
        >
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                    <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                      Brandix
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground sm:text-2xl font-light max-w-2xl mx-auto">
                    AI-powered brand naming that captures your vision
                  </p>
                </div>
              </div>
            </div>

            {/* Features Section */}
            {/* <div className="flex justify-center">
            <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background/80 to-muted/30 p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50" />
              <div className="absolute top-0 left-0 size-20 bg-gradient-to-br from-primary/20 to-transparent blur-2xl rounded-full" />
              <div className="absolute bottom-0 right-0 size-16 bg-gradient-to-tl from-primary/15 to-transparent blur-xl rounded-full" />

              <div className="relative space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    ✨ AI Brand Studio
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Just start typing in the message box below to chat with
                    Brandix
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        Smart Analysis
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deep brand insights & strategy
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                      <span className="text-lg">🌐</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        Domain Check
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Real-time availability
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          </div>
        </div>

        <div>
          <div className="inset-x-0 bottom-0 mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 md:px-5 md:pb-5">
            {promptSuggestions.length > 0 && (
              <div className="mb-3 flex flex-wrap-reverse items-center gap-2">
                {promptSuggestions.map((suggestion, i) => (
                  <Button
                    key={`${suggestion}-${i}`}
                    variant="ghost"
                    size="default"
                    className="h-9 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                    disabled={isGenerating}
                    onClick={() => {
                      sendMessage({ text: suggestion })
                      setInput('')
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            <PromptInput
              value={input}
              onValueChange={setInput}
              onSubmit={() => {
                if (!input.trim()) return
                sendMessage({ text: input })
                setInput('')
              }}
              className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-100% to-muted rounded-3xl pointer-events-none" />
              <div className="flex flex-col relative">
                <PromptInputTextarea
                  placeholder={
                    messages.length === 0
                      ? 'Describe what to name (e.g., AI startup, eco brand, open-source tool)'
                      : 'Reply to Brandix...'
                  }
                  className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base bg-transparent dark:bg-transparent"
                />

                <PromptInputActions className="mt-3 flex w-full items-center justify-end gap-2 p-2">
                  <Button
                    size="icon"
                    icon={RiArrowUpLine}
                    disabled={!input.trim() || isGenerating}
                    isLoading={isGenerating}
                    onClick={() => {
                      if (!input.trim()) return
                      sendMessage({ text: input })
                      setInput('')
                    }}
                    className="size-9 rounded-full"
                  />
                </PromptInputActions>
              </div>
            </PromptInput>
          </div>
        </div>
      </div>
    </>
  )
}
