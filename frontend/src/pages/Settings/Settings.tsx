import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/Card/Card'

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 20, maxWidth: 480 }}>
      <h3 style={{ marginBottom: 16 }}>{title}</h3>
      {children}
    </Card>
  )
}

export default function Settings() {
  const { session } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div>
      <h1 style={{ color: 'var(--color-text)', marginBottom: 24 }}>Settings</h1>

      <SettingsSection title="Account">
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Email</div>
          <div>{session?.user.email}</div>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance">
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: theme === 'light' ? 'var(--color-primary)' : 'transparent',
              color: theme === 'light' ? '#fff' : 'var(--color-text)',
            }}
          >
            Light
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: theme === 'dark' ? 'var(--color-primary)' : 'transparent',
              color: theme === 'dark' ? '#fff' : 'var(--color-text)',
            }}
          >
            Dark
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Business">
        <div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Business Name</div>
          <div>Sukses</div>
        </div>
      </SettingsSection>

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: '#e74c3c',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  )
}