import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import Card from '@/components/Card/Card'

export default function Settings() {
  const { session } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const email = session?.user.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <div>
      <h1 style={{ color: 'var(--color-text)', marginBottom: 24 }}>Pengaturan</h1>

      <Card style={{ boxShadow: 'var(--shadow-card)', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--color-accent)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{email}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Akun Pengguna</div>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--color-border)', marginBottom: 20 }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Bisnis Aktif
            </div>
            <div style={{ fontWeight: 700 }}>Sukses</div>
          </div>
          <Store size={22} color="var(--color-text-muted)" />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Tampilan
            </div>
            <div style={{ fontWeight: 700 }}>{theme === 'dark' ? 'Tema Gelap' : 'Tema Terang'}</div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              borderRadius: 20,
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              style={{
                padding: '6px 14px',
                borderRadius: 16,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: theme === 'light' ? 'var(--color-primary)' : 'transparent',
                color: theme === 'light' ? '#fff' : 'var(--color-text)',
              }}
            >
              Terang
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              style={{
                padding: '6px 14px',
                borderRadius: 16,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: theme === 'dark' ? 'var(--color-primary)' : 'transparent',
                color: theme === 'dark' ? '#fff' : 'var(--color-text)',
              }}
            >
              Gelap
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 14,
            border: 'none',
            background: '#e74c3c',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Keluar
        </button>
      </Card>
    </div>
  )
}