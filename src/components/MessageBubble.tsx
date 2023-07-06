import { dateToString } from '@/lib/timeAgo'
import { cn } from '@/lib/utils'
import { TimeAgo } from './TimeAgo'

type Props = {
  message: {
    content: string
    role: 'user' | 'assistant'
    createdAt: Date
  }
  className?: string
}

export const MessageBubble = ({ message, className }: Props) => {
  return (
    <div
      key={message.createdAt.getTime()}
      className={cn('flex flex-col gap-1', className)}
    >
      <div className={cn('flex max-w-full items-end gap-1.5')}>
        <div className={cn('flex max-w-full items-center gap-1.5')}>
          <div className="min-w-0 text-sm font-medium text-slate-800 dark:text-gray-200">
            You
          </div>
          <div
            className="text-xs font-light text-gray-500 dark:text-gray-400"
            title={dateToString(message.createdAt)}
          >
            <TimeAgo date={message.createdAt} />
          </div>
        </div>
      </div>
      <div className="flex items-center py-2 px-4 rounded-lg bg-slate-200 text-gray-800 dark:bg-slate-800 shrink-0 dark:text-gray-300 w-fit rounded-tl-none">
        „{message.content}“
      </div>
    </div>
  )
}
