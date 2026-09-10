import { useNotifications } from '@/features/notifications/useNotifications'

export default function Notifications() {
  const { notifications, loading } = useNotifications()

  return (
    <div>
      <h1 style={{ color: 'var(--color-text)', marginBottom: 24 }}>Notifications</h1>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No notifications right now</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: n.level === 'critical' ? '#fde2e2' : '#fff8e1',
                border: `1px solid ${n.level === 'critical' ? '#f5b7b1' : '#ffe082'}`,
              }}
            >
              <div style={{ fontWeight: 600, color: n.level === 'critical' ? '#c0392b' : '#b8860b' }}>
                {n.level === 'critical' ? 'Critical Stock' : 'Low Stock'}
              </div>
              <div>
                {n.name} is {n.level === 'critical' ? 'almost out of stock' : 'running low'}.
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Current stock: {n.stock} {n.unit}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}