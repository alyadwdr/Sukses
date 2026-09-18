import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--color-bg)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: '12px 20px 28px',
            width: '100%',
            maxHeight: '88vh',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-divider)' }} />
          </div>
          {children}
        </div>
      </div>
    )
  }

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