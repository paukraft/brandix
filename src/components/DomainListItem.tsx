import { Domain } from '@/app/generate/page'
import { cn } from '@/lib/utils'
import { Star, Wand2 } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { CopyButton } from './ui/CopyButton'
import { SimpleTooltip } from './ui/SimpleTooltip'
import { useToast } from './ui/use-toast'

type Props = {
  domain: Domain
  isLast?: boolean
  newSystemMessage: (message: string) => void
  send: (message: string) => void
  isFavorite: boolean
  setFavorites: Dispatch<SetStateAction<Domain[]>>
}

export const DomainListItem = ({
  domain,
  isLast,
  newSystemMessage,
  send,
  isFavorite,
  setFavorites,
}: Props) => {
  const { toast } = useToast()

  return (
    <div
      key={domain.name}
      className={cn(
        'group/item flex items-center justify-between px-4 py-2 rounded-lg border border-input hover:bg-accent/20 overflow-hidden relative dark:bg-zinc-900/10 shrink-0',
        !isLast && 'mb-3'
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
          <a href={`https://${domain.domain}`} target="_blank" rel="noreferrer">
            <div className="font-light text-sm">
              <span className="opacity-60">https://</span>
              {domain.domain}
            </div>
          </a>
          <CopyButton
            className="ml-2 group-hover/item:block hidden"
            text={domain.domain}
          />
        </div>
      </div>

      <div className="flex gap-3 md:gap-4">
        <div className="flex md:hidden group-hover/item:flex text-xs gap-1 md:gap-2 dark:text-gray-400">
          <SimpleTooltip
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <button
              onClick={() => {
                if (isFavorite) {
                  setFavorites((prev) =>
                    prev.filter((item) => item.domain !== domain.domain)
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
              <Star fill={isFavorite ? 'currentColor' : 'none'} size={16} />
            </button>
          </SimpleTooltip>

          <SimpleTooltip title="Generate Variations">
            <button
              onClick={() => {
                newSystemMessage(`Generate variations for ${domain.name}`)
                send(
                  `Give me 5 more variations similar to ${domain.name}, only brandnames no description or tagline`
                )
              }}
            >
              <Wand2 size={16} />
            </button>
          </SimpleTooltip>
        </div>
        <SimpleTooltip title={domain.whois}>
          <a
            href={`https://domainr.com/?q=${domain.domain}`}
            target="_blank"
            rel="noreferrer"
          >
            {domain.cantFigureOutAvailability ? (
              <div className="flex items-center gap-2 text-gray-400 hover:underline">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <div className="text-xs">Unknown probably for Sale</div>
              </div>
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
                  <div className="text-xs">
                    {domain.onlyProbably ? 'Probably Available' : 'Available'}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-700" />
                <div className="text-xs">Not Available</div>
              </div>
            )}
          </a>
        </SimpleTooltip>
      </div>
    </div>
  )
}
