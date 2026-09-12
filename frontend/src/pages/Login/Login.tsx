import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Store, Moon, Sun } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { useBusiness } from '@/context/BusinessContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { business } = useBusiness()

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
              background: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Store size={26} color="#fff" />
          </div>

          <h1 style={{ fontSize: 36, color: 'var(--color-text)', marginBottom: 12 }}>{business?.name ?? 'Sukses'}</h1>

          <p
            style={{
              color: 'var(--color-text)',
              opacity: 0.8,
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
                background: 'var(--color-bg)',
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
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: 14 }}>
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
              background: 'var(--color-primary)',
              color: '#fff',
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