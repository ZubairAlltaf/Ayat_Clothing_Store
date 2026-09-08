import React from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  animation?: 'fade-up' | 'fade-in' | 'stagger-children' | 'zoom-out' | 'parallax'
  delay?: number
  className?: string
}

export default function ScrollReveal({
  children,
  className = '',
}: ScrollRevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
