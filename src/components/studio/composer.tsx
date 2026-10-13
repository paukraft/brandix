import { ArrowUp, Stop } from "@phosphor-icons/react"
import { useLayoutEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

const MAX_HEIGHT = 200

export function Composer({
  placeholder,
  busy,
  onSend,
  onStop,
  autoFocus,
}: {
  placeholder: string
  busy: boolean
  onSend: (text: string) => void
  onStop: () => void
  autoFocus?: boolean
}) {
  const [text, setText] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  // Grow with the text, up to a cap, then scroll.
  useLayoutEffect(() => {
    const field = ref.current
    if (!field) return
    field.style.height = "auto"
    field.style.height = `${Math.min(field.scrollHeight, MAX_HEIGHT)}px`
  }, [text])

  const canSend = text.trim().length > 0 && !busy

  function submit() {
    if (!canSend) return
    onSend(text.trim())
    setText("")
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (busy) onStop()
        else submit()
      }}
      onClick={() => ref.current?.focus()}
      className="flex cursor-text items-end gap-2 rounded-[26px] bg-tile p-2 transition-shadow focus-within:ring-3 focus-within:ring-ring/15"
    >
      <textarea
        ref={ref}
        rows={1}
        value={text}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label="Message"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault()
            submit()
          }
        }}
        className="min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-body outline-none placeholder:text-muted-foreground"
      />
      {/* One button that turns from Send into Stop, its icons cross-fading. */}
      <Button
        type="submit"
        size="icon"
        aria-label={busy ? "Stop" : "Send"}
        disabled={!busy && !canSend}
        className="shrink-0"
      >
        <span
          className="t-icon-swap place-items-center"
          data-state={busy ? "b" : "a"}
        >
          <ArrowUp weight="bold" className="t-icon" data-icon="a" />
          <Stop weight="fill" className="t-icon size-3.5" data-icon="b" />
        </span>
      </Button>
    </form>
  )
}
