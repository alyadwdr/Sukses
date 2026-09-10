import { useNavigate } from 'react-router-dom'
import Card from '@/components/Card/Card'

export default function BusinessSelection() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        background: 'var(--color-bg)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--color-text)', marginBottom: 8 }}>Welcome Back!</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>What would you like to manage?</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: 220,
            height: 160,
            borderRadius: 16,
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          Sembako & Plastik
          <span style={{ fontSize: 14, fontWeight: 400 }}>Enter →</span>
        </button>

        <Card
          style={{
            width: 220,
            height: 160,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: 'var(--color-text-muted)',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'not-allowed',
          }}
        >
          Bengkel
          <span style={{ fontSize: 14, fontWeight: 400 }}>Coming Soon</span>
        </Card>
      </div>
    </div>
  )
}