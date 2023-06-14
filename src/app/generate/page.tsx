'use client'

import { BrandExample } from '@/components/BrandExample'
import { MessageBubble } from '@/components/MessageBubble'
import { NavBar } from '@/components/NavBar'
import { CopyButton } from '@/components/ui/CopyButton'
import { SimpleTooltip } from '@/components/ui/SimpleTooltip'
import { Button } from '@/components/ui/button'
import { Hr } from '@/components/ui/hr'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'
import { useStream } from '@/hooks/useStream'
import { cn } from '@/lib/utils'
import {
  Check,
  Lightbulb,
  List,
  ListX,
  RotateCcw,
  Send,
  Star,
  Wand2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

type BrandExamples = {
  title: string
  description: string
}[]

const brandExamples: BrandExamples = [
  {
    title: 'Brandable names',
    description: 'like Kodak and Adidas',
  },
  {
    title: 'Alternate spelling',
    description: 'like Digg and Flickr',
  },
  {
    title: 'Non-English words',
    description: 'like Huawei and IKEA',
  },
  {
    title: 'Compound words',
    description: 'like Instagram and MasterCard',
  },
  {
    title: 'Real words',
    description: 'like Oracle and Slack',
  },
  {
    title: 'Two words',
    description: 'like Coca-Cola and General Motors',
  },
  {
    title: 'Short phrase',
    description: 'like The Home Depot and Best Buy',
  },
]

type domain = {
  name: string
  domain: string
  available: boolean
  checking: boolean
  cantFigureOutAvailability?: boolean
  createdAt: Date
  whois?: string
}

export default function Home() {
  const scrollAreaRef = useRef<null | HTMLDivElement>(null)
  const { toast } = useToast()

  const [myMessage, setMyMessage] = useState('')
  const [domains, setDomains] = useState<domain[]>([])
  const [favorites, setFavorites] = useLocalStorage<domain[]>(
    'favoriteDomains',
    []
  )

  const [messages, setMessages] = useState<
    {
      content: string
      role: 'user' | 'assistant'
      createdAt: Date
    }[]
  >([])

  const [systemMessages, setSystemMessages] = useState<
    {
      message: string
      createdAt: Date
    }[]
  >([])

  const toRender = [...messages, ...domains, ...systemMessages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )

  const [onlyShowAvailable, setOnlyShowAvailable] = useState(false)

  const { send: sendStream, streamResponse } = useStream()

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      const { scrollHeight, clientHeight } = scrollArea

      scrollArea.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'auto',
      })
    }
  }

  const send = async (message: string) => {
    const groupedMessages = toRender.reduce((acc, item, i) => {
      // @ts-expect-error Der is dumm
      if (item.role === 'user') {
        // @ts-expect-error Der is dumm
        acc.push({ content: item.content, role: 'user' })
      } else {
        // @ts-expect-error Der is dumm
        if (acc.length === 0 || acc[acc.length - 1].role === 'user') {
          // @ts-expect-error Der is dumm
          acc.push({ content: `${i}. ${item.name}`, role: 'assistant' })
        } else {
          // @ts-expect-error Der is dumm
          acc[acc.length - 1].content += `\n${i}. ${item.name}`
        }
      }
      return acc
    }, [])

    sendStream({
      url: '/api/generate',
      body: {
        messages: [
          ...groupedMessages,
          {
            content: message,
            role: 'user',
          },
        ],
      },
    })
  }

  useEffect(() => {
    const splited = streamResponse.responseString
      .split('\n')
      .filter((item) => /^[0-9]/.test(item))

    const sliced = splited.slice(0, -1)

    const newDomains = (
      streamResponse.messageIsStreaming ? sliced : splited
    ).map((item) => item.replace(/^\d+\.\s/, ''))

    // Debugging
    if (!streamResponse.messageIsStreaming) {
      console.log(streamResponse.responseString)
    }

    newDomains.forEach((domain) => {
      const domainIndex = domains.findIndex((item) => item.name === domain)

      if (domainIndex === -1) {
        const url =
          domain
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]+/g, '') + '.com'
        setDomains((prev) => [
          ...prev,
          {
            name: domain,
            domain: url,
            available: false,
            checking: true,
            createdAt: new Date(),
          },
        ])

        checkDomain(url)
      }
    })
  }, [streamResponse])

  const checkDomain = async (domain: string) => {
    const response = await fetch('/api/check-domain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain: domain }),
    })

    if (!response.ok) {
      return
    }

    const data = await response.json()

    setDomains((prev) => {
      const newDomains = [...prev]

      const i = newDomains.findIndex((item) => item.domain === domain)

      newDomains[i] = {
        ...newDomains[i],
        available: data.available,
        checking: false,
        cantFigureOutAvailability: data.available === undefined,
        whois: data.whois,
      }

      return newDomains
    })
  }

  const newSystemMessage = (message: string) => {
    setSystemMessages((prev) => [
      ...prev,
      {
        message,
        createdAt: new Date(),
      },
    ])
  }

  useEffect(() => {
    scrollToBottom()
  }, [toRender])

  return (
    <main className="flex min-h-screen flex-col gap-6 relative">
      <NavBar />

      {/* Blob container */}
      <div className="fixed top-0 -translate-y-1/2 container w-full right-0 left-0 overflow-visible pointer-events-none">
        {/* Blob */}
        <div className="w-full aspect-square bg-blue-950 rounded-full blur-3xl opacity-10 scale-125" />
      </div>

      <div className="flex flex-col md:mt-4 lg:mt-8 xl:mt-20 max-w-2xl mx-auto w-full gap-2 px-4">
        <div
          className={cn(
            'invisible flex justify-end gap-2',
            toRender.length > 0 && 'visible'
          )}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOnlyShowAvailable((prev) => !prev)
            }}
          >
            {onlyShowAvailable ? (
              <List size={16} className="mr-1" />
            ) : (
              <Check size={16} className="mr-1" />
            )}
            {onlyShowAvailable ? 'Show All' : 'Only show available'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDomains([])
              setMessages([])
              setSystemMessages([])
            }}
          >
            <ListX size={16} className="mr-1" />
            Clear List
          </Button>
        </div>

        <ScrollArea
          ref={scrollAreaRef}
          className="h-[60svh]"
          scrollHideDelay={0}
        >
          {toRender.length === 0 && (
            <div className="h-[60svh]">
              <div className="mb-2 text-xl flex items-center">
                <Lightbulb size={20} className="mr-1" />
                Startingpoints:
              </div>
              <div className="w-full grid grid-cols-2 gap-3">
                {brandExamples.map((item, i) => (
                  <BrandExample
                    key={item.title}
                    brandExample={item}
                    onClick={() =>
                      send(`names for ${item.title} ${item.description}`)
                    }
                  />
                ))}
              </div>
            </div>
          )}
          {toRender.map((item, i) => {
            // @ts-expect-error Der is dumm
            if (item.domain) {
              // @ts-expect-error Der is dumm
              const domain: (typeof domains)[number] = item

              if (onlyShowAvailable && !domain.available) {
                return null
              }

              const isFavorite =
                favorites.findIndex((item) => item.domain === domain.domain) !==
                -1

              return (
                <div
                  key={domain.name + i} // FIXME: Use a better key
                  className={cn(
                    'group/item flex items-center justify-between px-4 py-2 rounded-lg border border-input hover:bg-accent/20 overflow-hidden relative bg-zinc-900/10 shrink-0',
                    i !== toRender.length - 1 && 'mb-3'
                  )}
                >
                  <div>
                    <div className="flex items-center">
                      {domain.name}
                      <CopyButton
                        className="ml-2 group-hover/item:block hidden"
                        text={domain.name}
                      />
                    </div>

                    <div className="flex items-center">
                      <div className="font-light text-sm">
                        <span className="opacity-60">https://</span>
                        {domain.domain}
                      </div>
                      <CopyButton
                        className="ml-2 group-hover/item:block hidden"
                        text={domain.domain}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="hidden group-hover/item:flex text-xs gap-2 text-gray-400">
                      <SimpleTooltip title="Mark as favorite">
                        <button
                          onClick={() => {
                            if (isFavorite) {
                              setFavorites((prev) =>
                                prev.filter(
                                  (item) => item.domain !== domain.domain
                                )
                              )
                              toast({
                                title: 'Removed from favorites',
                              })
                            } else {
                              setFavorites((prev) => [...prev, domain])
                              toast({
                                title: 'Added to favorites',
                              })
                            }
                          }}
                        >
                          <Star
                            fill={isFavorite ? 'currentColor' : ''}
                            size={16}
                          />
                        </button>
                      </SimpleTooltip>

                      <SimpleTooltip title="Generate Variations">
                        <button
                          onClick={() => {
                            newSystemMessage(
                              `Generate variations for ${domain.name}`
                            )
                            send(
                              `Give me 5 more variations similar to ${domain.name}`
                            )
                          }}
                        >
                          <Wand2 size={16} />
                        </button>
                      </SimpleTooltip>
                    </div>
                    <SimpleTooltip title={domain.whois}>
                      {domain.cantFigureOutAvailability ? (
                        <a
                          href={`https://domainr.com/?q=${domain.domain}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex items-center gap-2 text-gray-400 hover:underline">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <div className="text-xs">
                              Unknown probably for Sale
                            </div>
                          </div>
                        </a>
                      ) : domain.checking ? (
                        <>
                          <div className="flex items-center gap-2 relative animate-pulse">
                            <div className="w-1.5 h-1.5 absolute rounded-full bg-primary animate-ping" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <div className="text-xs">Checking...</div>
                          </div>
                        </>
                      ) : domain.available ? (
                        <>
                          {/* <div className="absolute left-0 w-full h-full bg-green-500 opacity-5 blur-lg" /> */}
                          <div className="flex items-center gap-2 text-green-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <div className="text-xs">Available</div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-red-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-700" />
                          <div className="text-xs">Not Available</div>
                        </div>
                      )}
                    </SimpleTooltip>
                  </div>
                </div>
              )
            }

            // @ts-expect-error Der is dumm
            if (item.role === 'user') {
              // @ts-expect-error Der is dumm
              const message: (typeof messages)[number] = item
              return (
                <MessageBubble
                  key={message.createdAt.getTime()}
                  className={cn(i !== toRender.length - 1 && 'mb-3')}
                  message={message}
                />
              )
            }

            // @ts-expect-error Der is dumm
            if (item.message) {
              // @ts-expect-error Der is dumm
              const systemMessage: (typeof systemMessages)[number] = item

              if (onlyShowAvailable) {
                return null
              }

              return (
                <div key={item.createdAt.getTime()} className={cn('-mt-3')}>
                  <Hr>{systemMessage.message}</Hr>
                </div>
              )
            }
          })}
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto w-full px-4 flex gap-2">
        <form
          className="border border-input rounded-lg flex items-center w-full px-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (streamResponse.messageIsStreaming) return
            send(`${myMessage} give me 5 brandname suggestions in a list`)
            setMessages((prev) => [
              ...prev,
              {
                content: myMessage,
                role: 'user',
                createdAt: new Date(),
              },
            ])
            setMyMessage('')
          }}
        >
          <input
            type="text"
            className="w-full h-12 text-base font-light placeholder:text-muted-foreground bg-transparent active:ring-0 focus:ring-0 focus:outline-none"
            value={myMessage}
            onChange={(e) => setMyMessage(e.target.value)}
            placeholder="Chat to generate new names..."
          />
          <SimpleTooltip title="Send">
            <Button
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-gray-300"
              type="submit"
              disabled={streamResponse.messageIsStreaming}
            >
              {streamResponse.messageIsStreaming ? (
                <Spinner className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </SimpleTooltip>
        </form>

        {toRender.length > 0 && (
          <SimpleTooltip title="Generate more">
            <Button
              variant="outline"
              className="py-6 rounded-lg"
              // disabled={streamResponse.messageIsStreaming}
              onClick={() => {
                if (streamResponse.messageIsStreaming) return
                newSystemMessage('Generate more')
                send(
                  `give me 5 more suggestions similar to the latest ones in a list`
                )
              }}
            >
              {streamResponse.messageIsStreaming ? (
                <Spinner className="w-5 h-5" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
            </Button>
          </SimpleTooltip>
        )}
      </div>
    </main>
  )
}
