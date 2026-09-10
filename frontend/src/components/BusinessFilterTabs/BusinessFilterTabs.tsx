import { useBusinessFilter } from '@/context/BusinessFilterContext'
import type { BusinessFilter } from '@/context/BusinessFilterContext'

const options: { label: string; value: BusinessFilter }[] = [
  { label: 'Sembako & Plastik', value: 'all' },
  { label: 'Plastik', value: 'plastik' },
  { label: 'Sembako', value: 'sembako' },
]

export default function BusinessFilterTabs() {
  const { filter, setFilter } = useBusinessFilter()

  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 4,
        borderRadius: 12,
        background: 'var(--color-card)',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFilter(opt.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: filter === opt.value ? 'var(--color-primary)' : 'transparent',
            color: filter === opt.value ? '#fff' : 'var(--color-text)',
            fontWeight: filter === opt.value ? 600 : 400,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}