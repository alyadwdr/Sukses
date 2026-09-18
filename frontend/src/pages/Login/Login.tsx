import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Store, Moon, Sun } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { useBusiness } from '@/context/BusinessContext'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { business } = useBusiness()
  const isMobile = useIsMobile()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setSaving(false)

    if (error) {
      setError('Email atau password salah.')
      return
    }

    navigate('/')
  }

  const themeToggleButton = (
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
        border: isMobile ? 'none' : '1px solid var(--color-border)',
        background: 'var(--color-card)',
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: isMobile ? 'var(--shadow-card)' : 'none',
      }}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )

  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-accent)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '64px 20px 40px',
        }}
      >
        {themeToggleButton}

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-inverse-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            flexShrink: 0,
          }}
        >
          <Store size={32} color="var(--color-on-inverse)" />
        </div>

        <h1
          style={{
            fontSize: 26,
            color: 'var(--color-on-accent)',
            marginBottom: 8,
            textAlign: 'center',
            lineHeight: 1.25,
          }}
        >
          {business?.name ?? 'Sukses'}
        </h1>
        <p style={{ color: 'var(--color-on-accent-muted)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
          Sistem Pencatatan Penjualan &amp; Inventori.
        </p>

        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: 360,
            background: 'var(--color-card)',
            borderRadius: 24,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ color: 'var(--color-text)', textAlign: 'center', marginBottom: 8, fontSize: 18 }}>Login Akun</h2>

          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '13px 14px 13px 42px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--color-surface-muted)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '13px 14px 13px 42px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--color-surface-muted)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {error && <p style={{ color: 'var(--color-danger-text)', fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: 14,
              borderRadius: 14,
              border: 'none',
              background: 'var(--color-primary-solid)',
              color: 'var(--color-on-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 6,
            }}
          >
            {saving ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    )
  }

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
      {themeToggleButton}

      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 780,
          gap: 20,
        }}
      >
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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-inverse-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Store size={26} color="var(--color-on-inverse)" />
          </div>

          <h1 style={{ fontSize: 36, color: 'var(--color-on-accent)', marginBottom: 12 }}>{business?.name ?? 'Sukses'}</h1>

          <p
            style={{
              color: 'var(--color-on-accent-muted)',
              fontSize: 15,
            }}
          >
            Sistem Pencatatan Penjualan & Inventori.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            flex: 1,
            background: 'var(--color-card)',
            borderRadius: 24,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 14,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2
            style={{
              color: 'var(--color-text)',
              marginBottom: 12,
            }}
          >
            Login Akun
          </h2>

          <div style={{ position: 'relative' }}>
            <Mail
              size={18}
              color="var(--color-text-muted)"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-muted)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock
              size={18}
              color="var(--color-text-muted)"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-muted)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--color-danger-text)', fontSize: 14 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: 12,
              borderRadius: 10,
              border: 'none',
              background: 'var(--color-primary-solid)',
              color: 'var(--color-on-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            {saving ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}