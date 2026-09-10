import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
}

export default function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}