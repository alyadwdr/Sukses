import { useBusinessFilter } from '@/context/BusinessFilterContext'
import { useIsMobile } from '@/hooks/useIsMobile'

const options: { label: string; value: 'all' | 'plastik' | 'sembako'; color: string }[] = [
  { label: 'Semua', value: 'all', color: 'var(--color-primary-text)' },
  { label: 'Sembako', value: 'sembako', color: 'var(--color-sembako)' },
  { label: 'Plastik', value: 'plastik', color: 'var(--color-plastik)' },
]

const desktopOptions: { label: string; value: 'all' | 'plastik' | 'sembako'; color: string }[] = [
  { label: 'Sembako & Plastik', value: 'all', color: 'var(--color-primary-text)' },
  { label: 'Plastik', value: 'plastik', color: 'var(--color-plastik)' },
  { label: 'Sembako', value: 'sembako', color: 'var(--color-sembako)' },
]

export default function BusinessFilterTabs() {
  const { filter, setFilter } = useBusinessFilter()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div
        style={{
          display: 'flex',
          padding: 4,
          borderRadius: 999,
          background: 'var(--color-surface-muted)',
          border: '1px solid var(--color-border)',
        }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: filter === opt.value ? 'var(--color-card)' : 'transparent',
              color: filter === opt.value ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: filter === opt.value ? 700 : 400,
              fontSize: 13,
              boxShadow: filter === opt.value ? 'var(--shadow-card)' : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 4,
        borderRadius: 999,
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {desktopOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFilter(opt.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: filter === opt.value ? opt.color : 'transparent',
            color: filter === opt.value ? 'var(--color-on-primary)' : 'var(--color-text)',
            fontWeight: filter === opt.value ? 600 : 400,
            fontSize: 13,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}