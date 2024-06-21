'use client'

import { BrandExample } from '@/components/BrandExample'
import { DomainExtensionSelect } from '@/components/DomainExtensionSelect'
import { DomainListItem } from '@/components/DomainListItem'
import { MessageBubble } from '@/components/MessageBubble'
import { OwnNameDialog } from '@/components/OwnNameDialog'
import { SimpleTooltip } from '@/components/ui/SimpleTooltip'
import { Button } from '@/components/ui/button'
import { Hr } from '@/components/ui/hr'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'
import { useStream } from '@/hooks/useStream'
import { cn } from '@/lib/utils'
import { Disclosure } from '@headlessui/react'
import { increment } from '@openpanel/nextjs'
import {
  Check,
  ChevronRight,
  Lightbulb,
  List,
  ListX,
  RotateCcw,
  Send,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useIsClient, useLocalStorage } from 'usehooks-ts'

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

export type Domain = {
  name: string
  domain: string
  available: boolean
  onlyProbably?: boolean
  checking: boolean
  cantFigureOutAvailability?: boolean
  createdAt: Date
  whois?: string
  errorWhileChecking?: boolean
}

export default function Home() {
  const scrollAreaRef = useRef<null | HTMLDivElement>(null)
  const { toast } = useToast()
  const isClient = useIsClient()

  const [myMessage, setMyMessage] = useState('')
  const [domains, setDomains] = useState<Domain[]>([])
  const [favorites, setFavorites] = useLocalStorage<Domain[]>(
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
  const [extension, setExtension] = useState('.com')

  const { send: sendStream, streamResponse } = useStream()

  const sendIsDisabled = streamResponse.messageIsStreaming || myMessage === ''

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
    const groupedMessages = [
      ...messages,
      ...domains.slice(-25),
      ...systemMessages,
    ]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .reduce((acc, item, i) => {
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

    increment('generate', 1)

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

  const getUrl = (brandname: string) => {
    return (
      brandname
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]+/g, '') + extension
    )
  }

  const createNewDomain = (brandname: string) => {
    const url = getUrl(brandname)
    setDomains((prev) => [
      ...prev,
      {
        name: brandname,
        domain: url,
        available: false,
        checking: true,
        createdAt: new Date(),
      },
    ])

    checkDomain(url)
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
    if (
      !streamResponse.messageIsStreaming &&
      isClient &&
      window.location.hostname !== 'localhost'
    ) {
      console.log(streamResponse.responseString)
    }

    newDomains.forEach((domain) => {
      const domainIndex = domains.findIndex((item) => item.name === domain)

      if (domainIndex === -1) {
        createNewDomain(domain)
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
      setDomains((prev) => {
        const newDomains = [...prev]

        const i = newDomains.findIndex((item) => item.domain === domain)

        newDomains[i] = {
          ...newDomains[i],
          errorWhileChecking: true,
          checking: false,
        }

        return newDomains
      })

      toast({
        title: 'Error',
        description: response.statusText,
      })
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
        onlyProbably: data.onlyProbably,
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
    <>
      <div className="flex flex-col md:mt-4 lg:mt-8 xl:mt-12 max-w-2xl mx-auto w-full gap-3 px-4">
        <div className={cn('flex justify-between gap-2')}>
          <DomainExtensionSelect
            extension={extension}
            setExtension={setExtension}
          />
          <div className={cn('flex gap-2')}>
            <OwnNameDialog createNewDomain={createNewDomain} />

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
              <span className="max-md:hidden">
                {onlyShowAvailable ? 'Show All' : 'Only show available'}
              </span>
              <span className="md:hidden">
                {onlyShowAvailable ? 'All' : 'Available'}
              </span>
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
              Clear <span className="max-md:hidden">List</span>
            </Button>
          </div>
        </div>

        <div className="h-[60svh] flex flex-col gap-3">
          {/* Favorites */}
          {isClient && favorites.length > 0 && (
            <Disclosure>
              {({ open }) => (
                <div className="flex flex-col rounded-lg border border-input p-4 py-2">
                  <Disclosure.Button className="flex items-center gap-1 text-sm">
                    <ChevronRight
                      size={16}
                      className={cn(
                        'transform duration-100',
                        open && 'rotate-90'
                      )}
                    />
                    Favorites ({favorites.length})
                  </Disclosure.Button>
                  <Disclosure.Panel
                    className={cn(
                      'flex-1 max-h-[50svh] flex flex-col',
                      favorites.filter(
                        (fav) =>
                          (onlyShowAvailable && fav.available) ||
                          !onlyShowAvailable
                      ).length > 0 && 'py-2'
                    )}
                  >
                    <ScrollArea scrollHideDelay={0} className="flex-1">
                      {favorites.map((domain, i) => {
                        if (onlyShowAvailable && !domain.available) {
                          return null
                        }

                        return (
                          <DomainListItem
                            key={domain.domain + 'favorite'}
                            domain={domain}
                            isFavorite={true}
                            newSystemMessage={newSystemMessage}
                            send={send}
                            setFavorites={setFavorites}
                            isLast={i === favorites.length - 1}
                          />
                        )
                      })}
                    </ScrollArea>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          )}

          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1"
            scrollHideDelay={0}
          >
            {toRender.length === 0 && (
              <div className="">
                <div className="mb-2 text-xl flex items-center mt-2">
                  <Lightbulb size={20} className="mr-1" />
                  Suggestions
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
                  favorites.findIndex(
                    (item) => item.domain === domain.domain
                  ) !== -1

                return (
                  <DomainListItem
                    key={domain.domain}
                    domain={domain}
                    newSystemMessage={newSystemMessage}
                    send={send}
                    isFavorite={isFavorite}
                    setFavorites={setFavorites}
                  />
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
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto w-full px-4 flex gap-2">
        <form
          className="border border-input rounded-lg flex items-center w-full px-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (sendIsDisabled) return
            send(
              `${myMessage} give me 5 brandname suggestions in a list, only brandnames no description or tagline`
            )
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
              className="whitespace-nowrap dark:text-gray-300"
              type="submit"
              disabled={sendIsDisabled}
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
              disabled={streamResponse.messageIsStreaming}
              onClick={() => {
                if (streamResponse.messageIsStreaming) return
                newSystemMessage('Generate more')
                send(
                  `give me 5 more suggestions similar to the latest ones in a list, only brandnames no description or tagline`
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
    </>
  )
}
