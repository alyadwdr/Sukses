import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function Topbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 24px 0' }}>
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
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