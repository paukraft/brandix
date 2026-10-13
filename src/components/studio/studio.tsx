import { useChat } from "@ai-sdk/react"
import {
  ArrowDown,
  CircleHalf,
  ClockCounterClockwise,
  Fingerprint,
  NotePencil,
  Star,
} from "@phosphor-icons/react"
import { getRouteApi } from "@tanstack/react-router"
import { DefaultChatTransport } from "ai"
import { useEffect, useRef, useState } from "react"
import { useStickToBottom } from "use-stick-to-bottom"

import { LogoMark, Wordmark } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Dialog, DialogBody } from "@/components/ui/dialog"
import { IconButton } from "@/components/ui/icon-button"
import { Composer } from "@/components/studio/composer"
import { History } from "@/components/studio/history"
import { Shortlist } from "@/components/studio/shortlist"
import { StudioContext } from "@/components/studio/studio-context"
import { TASTE_DESCRIPTION, Taste } from "@/components/studio/taste"
import { Thread } from "@/components/studio/thread"
import { useConversations } from "@/hooks/use-conversations"
import { useFavorites } from "@/hooks/use-favorites"
import { useTaste } from "@/hooks/use-taste"
import type { BrandixMessage } from "@/lib/chat"
import { toggleTheme } from "@/lib/theme"

const STARTERS = [
  "An AI startup that writes release notes",
  "A short name for a fintech app",
  "An open-source tool for local-first sync",
]

const FOLLOW_UPS = ["More like these", "Shorter names", "Try a different style"]

const route = getRouteApi("/")

/** The room in px the latest prompt keeps above it, the thread's own padding. */
const PROMPT_GAP = 32

/** An accent dot on a header button that pops in and out. */
function Badge({ open }: { open: boolean }) {
  return (
    <span className="t-badge top-1.5 right-1.5" data-open={open}>
      <span className="t-badge-dot size-1.5 rounded-full bg-accent" />
    </span>
  )
}

function Chips({
  chips,
  onPick,
}: {
  chips: string[]
  onPick: (chip: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip, index) => (
        <Button
          key={chip}
          variant="soft"
          size="sm"
          onClick={() => onPick(chip)}
          style={{ "--i": index } as React.CSSProperties}
          className="t-rise text-muted-foreground hover:text-foreground"
        >
          {chip}
        </Button>
      ))}
    </div>
  )
}

export function Studio() {
  const taste = useTaste()
  const tasteRef = useRef(taste.payload)
  tasteRef.current = taste.payload

  // The open conversation is the one the URL names; until a first message
  // puts it there, a new one goes by an id of its own.
  const { c } = route.useSearch()
  const navigate = route.useNavigate()
  const [draftId, setDraftId] = useState(() => crypto.randomUUID())
  const id = c ?? draftId
  useEffect(() => {
    if (!c) setDraftId(crypto.randomUUID())
  }, [c])

  const [transport] = useState(
    () =>
      new DefaultChatTransport<BrandixMessage>({
        api: "/api/chat",
        body: () => ({ taste: tasteRef.current }),
      })
  )
  const {
    messages,
    sendMessage,
    setMessages,
    regenerate,
    stop,
    status,
    error,
    clearError,
  } = useChat<BrandixMessage>({ id, transport })

  const { favorites } = useFavorites()
  const [followUps, setFollowUps] = useState<string[] | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [tasteOpen, setTasteOpen] = useState(false)
  const [shortlistOpen, setShortlistOpen] = useState(false)
  const promptRef = useRef<HTMLDivElement>(null)
  const { scrollRef, contentRef, isAtBottom, scrollToBottom } =
    useStickToBottom({
      resize: "smooth",
      initial: "instant",
      // Follow a reply only until its prompt reaches the top of the scroller.
      targetScrollTop: (bottom, { contentElement }) =>
        promptRef.current
          ? promptRef.current.offsetTop - contentElement.offsetTop - PROMPT_GAP
          : bottom,
    })

  const busy = status === "submitted" || status === "streaming"
  const started = messages.length > 0 || c !== undefined

  const { conversations, save, remove } = useConversations()
  const saved = conversations.find((conversation) => conversation.id === id)
  useEffect(() => {
    if (saved && !messages.length) setMessages(saved.messages)
  }, [saved, messages.length, setMessages])
  useEffect(() => {
    if (!busy && messages.length) save(id, messages)
  }, [busy, messages, id, save])

  function send(text: string, next: string[] | null = null) {
    if (busy) return
    clearError()
    setShortlistOpen(false)
    setFollowUps(next)
    void sendMessage({ text })
    void scrollToBottom()
    if (!c) void navigate({ search: { c: id } })
  }

  /** Opens a past conversation, or a new one. A reply under way is stopped and kept. */
  async function open(conversation?: string) {
    await stop()
    setHistoryOpen(false)
    setFollowUps(null)
    await navigate({ search: { c: conversation } })
  }

  // Close the mobile dialogs when the viewport grows into the side-by-side layout.
  useEffect(() => {
    const wide = matchMedia("(min-width: 768px)")
    const close = () => {
      if (!wide.matches) return
      setTasteOpen(false)
      setShortlistOpen(false)
    }
    wide.addEventListener("change", close)
    return () => wide.removeEventListener("change", close)
  }, [])

  const composer = (
    <Composer
      autoFocus
      busy={busy}
      onSend={(text) => send(text)}
      onStop={() => void stop()}
      placeholder={
        started
          ? "Refine, react, or ask for more…"
          : "Describe what you're naming…"
      }
    />
  )

  return (
    <StudioContext.Provider value={{ send, busy }}>
      <main className="flex h-svh flex-col px-2 pb-2">
        <header className="flex h-14 shrink-0 items-center gap-1 px-2 sm:px-3">
          <button
            type="button"
            onClick={() => void open()}
            className="rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Wordmark />
          </button>
          <span className="flex-1" />

          <IconButton
            label="Taste"
            onClick={() => setTasteOpen(true)}
            className="relative md:hidden"
          >
            <Fingerprint />
            <Badge open={taste.traits.length > 0} />
          </IconButton>
          <IconButton
            label="Shortlist"
            onClick={() => setShortlistOpen(true)}
            className="relative md:hidden"
          >
            <Star />
            <Badge open={favorites.length > 0} />
          </IconButton>
          {conversations.length > 0 && (
            <IconButton label="History" onClick={() => setHistoryOpen(true)}>
              <ClockCounterClockwise />
            </IconButton>
          )}
          {started && (
            <IconButton label="New conversation" onClick={() => void open()}>
              <NotePencil />
            </IconButton>
          )}
          <IconButton label="Toggle theme" onClick={toggleTheme}>
            <CircleHalf />
          </IconButton>
        </header>

        <div className="grid min-h-0 flex-1 rounded-window bg-card p-2 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_400px]">
          <section className="flex min-h-0 min-w-0 flex-col">
            {started ? (
              <div ref={scrollRef} className="min-h-0 flex-1 scroll-quiet">
                <div ref={contentRef} className="flex min-h-full flex-col">
                  <Thread
                    messages={messages}
                    status={status}
                    error={error}
                    promptRef={promptRef}
                    onRetry={() => {
                      clearError()
                      void regenerate()
                    }}
                  />

                  {/* Stuck to the bottom of the scroller, so the thread runs under it. */}
                  <div className="pointer-events-none sticky bottom-0 mx-auto mt-auto flex w-full max-w-2xl flex-col gap-2 bg-linear-to-t from-card from-[calc(100%-1.5rem)] to-transparent px-2 pt-6 pb-2 *:pointer-events-auto sm:px-4">
                    {!isAtBottom && (
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label="Scroll to latest"
                        onClick={() => void scrollToBottom()}
                        className="t-rise absolute inset-x-0 -top-6 mx-auto size-8"
                      >
                        <ArrowDown />
                      </Button>
                    )}
                    {!busy && !error && (
                      <Chips
                        chips={followUps ?? FOLLOW_UPS}
                        onPick={(chip) => send(chip)}
                      />
                    )}
                    {composer}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
                <div className="flex w-full max-w-xl flex-col">
                  <span className="t-stagger-line grid size-12 place-items-center rounded-xl bg-tile">
                    <LogoMark className="size-7" />
                  </span>
                  <h1 className="t-stagger-line mt-6 text-display font-normal text-balance [--line:1]">
                    What are you naming?
                  </h1>
                  <p className="t-stagger-line mt-2 text-body text-pretty text-muted-foreground [--line:2]">
                    Describe it in a sentence. Brandix only shows names whose
                    domain you can register.
                  </p>
                  <div className="t-stagger-line mt-8 [--line:3]">
                    {composer}
                  </div>
                  <div className="t-stagger-line mt-3 [--line:4]">
                    <Chips chips={STARTERS} onPick={(chip) => send(chip)} />
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="hidden min-h-0 flex-col md:flex">
            <Taste variant="pane" taste={taste} />
            <div className="min-h-0 flex-1">
              <Shortlist variant="pane" />
            </div>
          </aside>
        </div>
      </main>

      <Dialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title="History"
        description="Your conversations stay on this device."
        className="h-[600px]"
      >
        <History
          conversations={conversations}
          onOpen={(conversation) => void open(conversation)}
          onRemove={async (conversation) => {
            // Left first: an open conversation would save itself again.
            if (conversation === c) await open()
            remove(conversation)
          }}
        />
      </Dialog>
      <Dialog
        open={tasteOpen}
        onOpenChange={setTasteOpen}
        title="Taste"
        description={TASTE_DESCRIPTION}
      >
        <DialogBody>
          <Taste variant="dialog" taste={taste} />
        </DialogBody>
      </Dialog>
      <Dialog
        open={shortlistOpen}
        onOpenChange={setShortlistOpen}
        title="Shortlist"
      >
        <DialogBody>
          <Shortlist variant="dialog" />
        </DialogBody>
      </Dialog>
    </StudioContext.Provider>
  )
}
