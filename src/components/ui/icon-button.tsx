import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** A ghost icon button named by its tooltip, unless `aria-label` says more. */
function IconButton({
  label,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip
      trigger={
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className={cn(
            "size-8 text-muted-foreground hover:text-foreground",
            className
          )}
          {...props}
        />
      }
    >
      {label}
    </Tooltip>
  )
}

export { IconButton }
