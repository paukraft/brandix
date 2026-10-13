import { cn } from "@/lib/utils"

/** "b." — the brand, and the dot every domain hangs on. The dot takes the accent. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-5", className)}
    >
      <path
        d="M7 5.5V21"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle
        cx="12.5"
        cy="21"
        r="5.5"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <circle cx="24.5" cy="25.75" r="2.5" className="fill-accent" />
    </svg>
  )
}

/** The wordmark, closed by the same accent dot. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("text-heading font-semibold tracking-[-0.03em]", className)}
    >
      brandix<span className="text-accent">.</span>
    </span>
  )
}
