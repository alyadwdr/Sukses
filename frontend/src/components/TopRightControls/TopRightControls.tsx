import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import NotificationBell from '@/components/NotificationBell/NotificationBell'

export default function TopRightControls() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <NotificationBell />
      <button
        onClick={toggleTheme}
        aria-label="Ganti tema"
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
        }}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  )
}