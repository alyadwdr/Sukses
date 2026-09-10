import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Wrench, ArrowRight, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import Card from '@/components/Card/Card'

export default function BusinessSelection() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        position: 'relative',
        padding: 24,
      }}
    >
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
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
        }}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div style={{ display: 'flex', width: '100%', maxWidth: 900, gap: 20 }}>
        <div
          style={{
            flex: 1,
            background: 'var(--color-accent)',
            borderRadius: 24,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h1 style={{ fontSize: 32, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.2 }}>
            Siap bekerja?
          </h1>
          <p style={{ color: 'var(--color-text)', opacity: 0.8, fontSize: 15 }}>
            Pilih unit bisnis untuk membuka dashboard.
          </p>
        </div>

        <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-primary)',
              borderRadius: 24,
              padding: 28,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 600, color: '#fff' }}>Sembako & Plastik</div>
                <div style={{ fontSize: 14, color: '#fff', opacity: 0.85 }}>
                  Kelola inventori, penjualan, dan laporan.
                </div>
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ArrowRight size={18} color="var(--color-primary)" />
            </div>
          </button>

          <Card
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 28,
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wrench size={22} color="var(--color-text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 600, color: 'var(--color-text)' }}>Bengkel Motors</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                  Fitur sedang dalam pengembangan.
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 20,
                background: 'var(--color-bg)',
                color: 'var(--color-text-muted)',
                flexShrink: 0,
              }}
            >
              Segera Hadir
            </span>
          </Card>
        </div>
      </div>
    </div>
  )
}