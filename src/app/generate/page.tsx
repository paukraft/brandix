'use client'

import { NavBar } from '@/components/NavBar'
import { TimeAgo } from '@/components/TimeAgo'
import { CopyButton } from '@/components/ui/CopyButton'
import { SimpleTooltip } from '@/components/ui/SimpleTooltip'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'
import { useStream } from '@/hooks/useStream'
import { dateToString } from '@/lib/timeAgo'
import { cn } from '@/lib/utils'
import { Check, List, Send, Wand2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const domainsStatic: {
  name: string
  domain: string
  available: boolean
  checking: boolean
  createdAt: Date
}[] = [
  {
    name: 'Tangled',
    domain: 'tangled.com',
    available: false,
    checking: true,
    createdAt: new Date(),
  },
  {
    name: 'Tangled',
    domain: 'tangled.com',
    available: false,
    checking: false,
    createdAt: new Date(),
  },
  {
    name: 'Tangled',
    domain: 'tangled.com',
    available: true,
    checking: false,
    createdAt: new Date(),
  },
]

export default function Home() {
  const [myMessage, setMyMessage] = useState('')
  const [domains, setDomains] = useState<
    {
      name: string
      domain: string
      available: boolean
      checking: boolean
      createdAt: Date
    }[]
  >([])

  const [messages, setMessages] = useState<
    {
      content: string
      role: 'user' | 'assistant'
      createdAt: Date
    }[]
  >([])

  const toRender = [...messages, ...domains].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )

  const [onlyShowAvailable, setOnlyShowAvailable] = useState(false)

  const { send: sendStream, streamResponse } = useStream()
  const { toast } = useToast()

  const send = async (message: string) => {
    sendStream({
      url: '/api/generate',
      body: {
        messages: [
          ...toRender.map((item, i) => {
            // @ts-expect-error Der is dumm
            if (item.domain) {
              // @ts-expect-error Der is dumm
              const domain: (typeof domains)[number] = item
              return {
                content: `${i}. ${domain.name}`,
                role: 'assistant',
              }
            }

            // @ts-expect-error Der is dumm
            if (item.role === 'user') {
              // @ts-expect-error Der is dumm
              const message: (typeof messages)[number] = item
              return {
                content: message.content,
                role: 'user',
              }
            }
          }),
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

    if (!streamResponse.messageIsStreaming) {
      console.log(streamResponse.responseString)
    }

    newDomains.forEach((domain) => {
      const domainIndex = domains.findIndex((item) => item.name === domain)

      if (domainIndex === -1) {
        setDomains((prev) => [
          ...prev,
          {
            name: domain,
            domain:
              domain
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9-]+/g, '') + '.com',
            available: false,
            checking: true,
            createdAt: new Date(),
          },
        ])
      }
    })
  }, [streamResponse])

  useEffect(() => {
    domains.forEach(async (domain, i) => {
      if (domain.checking) {
        const response = await fetch('/api/check-domain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain: domain.domain }),
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()

        setDomains((prev) => {
          const newDomains = [...prev]

          newDomains[i] = {
            ...newDomains[i],
            available: data.available,
            checking: false,
          }

          return newDomains
        })
      }
    })
  }, [domains])

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
            }}
          >
            <X size={16} className="mr-1" />
            Clear All
          </Button>
        </div>

        <ScrollArea className="h-[60svh]" scrollHideDelay={0}>
          {toRender.map((item, i) => {
            // @ts-expect-error Der is dumm
            if (item.domain) {
              // @ts-expect-error Der is dumm
              const domain: (typeof domains)[number] = item

              if (onlyShowAvailable && !domain.available) {
                return null
              }
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
                    <div className="hidden group-hover/item:flex text-xs gap-1 text-gray-400">
                      <SimpleTooltip title="Make Variation">
                        <button
                          onClick={() =>
                            send(`Give me more variations like ${domain.name}`)
                          }
                        >
                          <Wand2 size={16} />
                        </button>
                      </SimpleTooltip>
                    </div>
                    {domain.checking ? (
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
                  </div>
                </div>
              )
            }

            // @ts-expect-error Der is dumm
            if (item.role === 'user') {
              // @ts-expect-error Der is dumm
              const message: (typeof messages)[number] = item
              return (
                <div
                  key={item.createdAt.getTime()}
                  className={cn(
                    'flex flex-col gap-1',
                    i !== toRender.length - 1 && 'mb-3'
                  )}
                >
                  <div className={cn('flex max-w-full items-end gap-1.5')}>
                    <div className={cn('flex max-w-full items-center gap-1.5')}>
                      <div className="min-w-0 text-sm font-medium text-gray-200">
                        You
                      </div>
                      <div
                        className="text-xs font-light text-gray-400"
                        title={dateToString(message.createdAt)}
                      >
                        <TimeAgo date={message.createdAt} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center py-2 px-4 rounded-lg bg-slate-800 shrink-0 text-gray-300 w-fit rounded-tl-none">
                    „{message.content}“
                  </div>
                </div>
              )
            }
          })}
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <form
          className="border border-input rounded-lg flex items-center w-full px-4"
          onSubmit={(e) => {
            e.preventDefault()
            send(`${myMessage} give me 5 brandname suggestions`)
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
            className="w-full h-12 text-base font-light placeholder-gray-400 bg-transparent active:ring-0 focus:ring-0 focus:outline-none"
            value={myMessage}
            onChange={(e) => setMyMessage(e.target.value)}
            placeholder="Chat to generate new domains..."
          />
          <SimpleTooltip title="Send">
            <Button
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-gray-300"
              type="submit"
            >
              {streamResponse.messageIsStreaming ? (
                <Spinner />
              ) : (
                <Send className="w-5" />
              )}
            </Button>
          </SimpleTooltip>
        </form>
      </div>
    </main>
  )
}
