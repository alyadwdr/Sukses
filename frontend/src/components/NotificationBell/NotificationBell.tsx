import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/context/NotificationsContext'

export default function NotificationBell() {
  const { notifications } = useNotifications()
  const [open, setOpen] = useState(false)
  const [seenCount, setSeenCount] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const unseenCount = Math.max(0, notifications.length - seenCount)

  function handleToggle() {
    setOpen((v) => {
      const next = !v
      if (next) setSeenCount(notifications.length)
      return next
    })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        aria-label="Notifikasi"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid var(--color-border)',
          background: 'var(--color-card)',
          color: 'var(--color-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Bell size={18} />
        {unseenCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: 'var(--color-danger)',
              color: 'var(--color-on-primary)',
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: 300,
            maxHeight: 360,
            overflowY: 'auto',
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            boxShadow: 'var(--shadow-card)',
            padding: 12,
            zIndex: 50,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--color-text)' }}>
            Notifikasi
          </div>

          {notifications.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Tidak ada notifikasi saat ini</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: n.level === 'critical' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                    border: `1px solid ${n.level === 'critical' ? 'var(--color-danger-border)' : 'var(--color-warning-border)'}`,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 12, color: n.level === 'critical' ? 'var(--color-danger-text)' : 'var(--color-warning-text)' }}>
                    {n.level === 'critical' ? 'Stok Kritis' : 'Stok Menipis'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text)' }}>
                    {n.name} — {n.stock} {n.unit}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}