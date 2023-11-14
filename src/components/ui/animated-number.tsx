'use client'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

export const AnimatedNumber = ({ value }: { value: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true, // Trigger just once
  })
  const [start, setStart] = useState(0)

  useEffect(() => {
    if (inView) {
      setStart(value * 0.995)
    }
  }, [inView, value])

  return (
    <div ref={ref} className={cn(!inView && 'opacity-0')}>
      <CountUp start={start} end={value} duration={100} separator="." />
    </div>
  )
}
