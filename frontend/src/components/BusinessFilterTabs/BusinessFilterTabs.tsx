import { useBusinessFilter } from '@/context/BusinessFilterContext'

const options: { label: string; value: 'all' | 'plastik' | 'sembako'; color: string }[] = [
  { label: 'Sembako & Plastik', value: 'all', color: 'var(--color-primary-text)' },
  { label: 'Plastik', value: 'plastik', color: 'var(--color-plastik)' },
  { label: 'Sembako', value: 'sembako', color: 'var(--color-sembako)' },
]

export default function BusinessFilterTabs() {
  const { filter, setFilter } = useBusinessFilter()

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
      {options.map((opt) => (
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