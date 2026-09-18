import type { ReactNode } from 'react'
import { Plus, Menu, Store, Moon, Sun } from 'lucide-react'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'
import NotificationBell from '@/components/NotificationBell/NotificationBell'
import { useBusiness } from '@/context/BusinessContext'
import { useMoreMenu } from '@/context/MoreMenuContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useTheme } from '@/context/ThemeContext'

interface PageTopBarProps {
  title: string
  action?: ReactNode
  showFilter?: boolean
  /** Mobile only: shows a compact "+" button top-right instead of the hamburger. */
  onMobileAdd?: () => void
}

export default function PageTopBar({ title, action, showFilter = true, onMobileAdd }: PageTopBarProps) {
  const isMobile = useIsMobile()
  const { business } = useBusiness()
  const { openMore } = useMoreMenu()
  const { theme, toggleTheme } = useTheme()

  if (isMobile) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'var(--color-inverse-surface)',
                color: 'var(--color-on-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Store size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {business?.name ?? 'Sukses'}
              </div>
              <h1 style={{ color: 'var(--color-text)', fontSize: 20, lineHeight: 1.2 }}>{title}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <NotificationBell />
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Mode gelap' : 'Mode terang'}
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
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            {onMobileAdd ? (
              <button
                onClick={onMobileAdd}
                aria-label="Tambah"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--color-inverse-surface)',
                  color: 'var(--color-on-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Plus size={18} />
              </button>
            ) : (
              <button
                onClick={openMore}
                aria-label="Menu lainnya"
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
                <Menu size={18} />
              </button>
            )}
          </div>
        </div>

        {action}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16,
        flexWrap: 'wrap',
        paddingRight: 110,
      }}
    >
      <h1 style={{ color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{title}</h1>

      {showFilter && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 200 }}>
          <BusinessFilterTabs />
        </div>
      )}

      {action}
    </div>
  )
}