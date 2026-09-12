import { Infinity as InfinityIcon, Sun, Calendar, CalendarRange, SlidersHorizontal } from 'lucide-react'

export type TimeFilterValue = 'all' | 'today' | 'month' | 'year' | 'custom'

interface TimeFilterTabsProps {
  value: TimeFilterValue
  onChange: (value: TimeFilterValue) => void
  customFrom: string
  customTo: string
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
  onApplyCustom: () => void
}

const options: { label: string; value: TimeFilterValue; icon: React.ReactNode }[] = [
  { label: 'Semua', value: 'all', icon: <InfinityIcon size={15} /> },
  { label: 'Hari Ini', value: 'today', icon: <Sun size={15} /> },
  { label: 'Bulan Ini', value: 'month', icon: <Calendar size={15} /> },
  { label: 'Tahun Ini', value: 'year', icon: <CalendarRange size={15} /> },
]

const dateInputStyle = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
}

export default function TimeFilterTabs({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
}: TimeFilterTabsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 20,
            border: value === opt.value ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: value === opt.value ? 'rgba(149,177,238,0.15)' : 'var(--color-card)',
            color: value === opt.value ? 'var(--color-primary)' : 'var(--color-text)',
            fontWeight: value === opt.value ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}

      <button
        onClick={() => onChange('custom')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 20,
          border: `1px dashed ${value === 'custom' ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: value === 'custom' ? 'rgba(149,177,238,0.15)' : 'transparent',
          color: value === 'custom' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          fontWeight: value === 'custom' ? 600 : 400,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <SlidersHorizontal size={15} />
        Pilih Tanggal
      </button>

      {value === 'custom' && (
        <>
          <input type="date" value={customFrom} onChange={(e) => onCustomFromChange(e.target.value)} style={dateInputStyle} />
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>sampai</span>
          <input type="date" value={customTo} onChange={(e) => onCustomToChange(e.target.value)} style={dateInputStyle} />
          <button
            onClick={onApplyCustom}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Terapkan
          </button>
        </>
      )}
    </div>
  )
}