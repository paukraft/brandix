import { timeAgo } from '@/lib/timeAgo'
import { useEffect, useState } from 'react'

type Props = {
  date: Date
}

export const TimeAgo = ({ date }: Props) => {
  const [timeAgoState, setTimeAgoState] = useState(timeAgo(date))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgoState(timeAgo(date))
    }, 30000)

    return () => clearInterval(interval)
  }, [date])

  return <>{timeAgoState}</>
}
