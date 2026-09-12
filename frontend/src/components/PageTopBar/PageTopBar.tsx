import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'

interface PageTopBarProps {
  title: string
  action?: ReactNode
  showFilter?: boolean
}

export default function PageTopBar({ title, action, showFilter = true }: PageTopBarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <h1 style={{ color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{title}</h1>

      {showFilter && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 200 }}>
          <BusinessFilterTabs />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {action}
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
            flexShrink: 0,
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  )
}