import type { ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-card)',
          borderRadius: 20,
          padding: 32,
          width: '100%',
          maxWidth: 640,
          boxShadow: 'var(--shadow-card)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}