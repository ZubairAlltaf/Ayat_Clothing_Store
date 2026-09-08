'use client'

import { useEffect, useState } from 'react'

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-2 text-charcoal bg-champagne/80 px-3 py-1.5 backdrop-blur-sm shadow-sm border border-border">
      <div className="flex flex-col items-center min-w-[24px]">
        <span className="font-serif text-sm leading-none">{timeLeft.days}</span>
        <span className="eyebrow text-[0.45rem] mt-0.5">DAYS</span>
      </div>
      <span className="text-ink-faint text-xs pb-2">:</span>
      <div className="flex flex-col items-center min-w-[24px]">
        <span className="font-serif text-sm leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="eyebrow text-[0.45rem] mt-0.5">HRS</span>
      </div>
      <span className="text-ink-faint text-xs pb-2">:</span>
      <div className="flex flex-col items-center min-w-[24px]">
        <span className="font-serif text-sm leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="eyebrow text-[0.45rem] mt-0.5">MIN</span>
      </div>
      <span className="text-ink-faint text-xs pb-2">:</span>
      <div className="flex flex-col items-center min-w-[24px]">
        <span className="font-serif text-sm leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="eyebrow text-[0.45rem] mt-0.5">SEC</span>
      </div>
    </div>
  )
}
