import { Domain } from '@/app/generate/page'
import { shareNameClient } from '@/lib/client/sharedNamesClient'
import { cn } from '@/lib/utils'
import { Share2, Star, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { CopyButton } from './ui/CopyButton'
import { SimpleTooltip } from './ui/SimpleTooltip'
import { useToast } from './ui/use-toast'

type Props = {
  domain: Domain
  isLast?: boolean
  newSystemMessage: (message: string) => void
  send: (message: string) => void
  generateVariants: (name: string) => void
  isFavorite: boolean
  setFavorites: Dispatch<SetStateAction<Domain[]>>
}

export const DomainListItem = ({
  domain,
  isLast,
  newSystemMessage,
  send,
  generateVariants,
  isFavorite,
  setFavorites,
}: Props) => {
  const { toast } = useToast()
  const [shared, setShared] = useState(false)
  const [upvotedNames, setUpvotedNames] = useLocalStorage<string[]>(
    'upvotedNames',
    []
  )

  useEffect(() => {
    if (upvotedNames.includes(domain.name)) {
      setShared(true)
    }
  }, [domain.name, upvotedNames])

  return (
    <div
      key={domain.name}
      className={cn(
        'group/item flex items-center justify-between px-3 py-2 rounded-lg gap-2 border border-input hover:bg-accent/20 overflow-hidden relative dark:bg-zinc-900/10',
        !isLast && 'mb-3'
      )}
    >
      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center">
          {domain.name}
          <CopyButton
            className="ml-2 group-hover/item:block hidden"
            text={domain.name}
          />
        </div>

        <div className="flex items-center">
          <a href={`https://${domain.domain}`} target="_blank" rel="noreferrer">
            <div className="font-light text-sm line-clamp-1">
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

      <div className="flex gap-3 md:gap-4 items-center">
        <div className="flex md:hidden group-hover/item:flex text-xs gap-1 md:gap-2 dark:text-gray-400">
          {shared ? (
            <SimpleTooltip title="Go to shared page">
              <Link href={`/shared-names/${domain.name}`} target="_blank">
                <Share2 fill="currentColor" size={16} />
              </Link>
            </SimpleTooltip>
          ) : (
            <SimpleTooltip title="Share with brandix community">
              <button
                onClick={async () => {
                  shareNameClient({ name: domain.name })

                  setUpvotedNames([...upvotedNames, domain.name])
                  setShared(true)
                  toast({
                    title: 'Shared with community',
                  })
                }}
              >
                <Share2 size={16} />
              </button>
            </SimpleTooltip>
          )}

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
                generateVariants(domain.name)
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
            {domain.errorWhileChecking ? (
              <div className="flex items-center gap-2 text-red-700 hover:underline">
                <div className="w-1.5 h-1.5 rounded-full bg-red-700" />
                <div className="text-xs max-xs:hidden">
                  Error while checking
                </div>
              </div>
            ) : domain.cantFigureOutAvailability ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:underline">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400" />
                <div className="text-xs max-xs:hidden">
                  Unknown probably for Sale
                </div>
              </div>
            ) : domain.checking ? (
              <>
                <div className="flex items-center gap-2 relative animate-pulse">
                  <div className="w-1.5 h-1.5 absolute rounded-full bg-primary animate-ping" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <div className="text-xs max-xs:hidden">Checking...</div>
                </div>
              </>
            ) : domain.available ? (
              <>
                {/* <div className="absolute left-0 w-full h-full bg-green-500 opacity-5 blur-lg" /> */}
                <div className="flex items-center gap-2 text-green-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <div className="text-xs max-xs:hidden">
                    {domain.onlyProbably ? 'Probably Available' : 'Available'}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-700" />
                <div className="text-xs max-xs:hidden">Not Available</div>
              </div>
            )}
          </a>
        </SimpleTooltip>
      </div>
    </div>
  )
}
