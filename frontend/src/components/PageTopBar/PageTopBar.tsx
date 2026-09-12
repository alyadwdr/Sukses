import type { ReactNode } from 'react'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'

interface PageTopBarProps {
  title: string
  action?: ReactNode
  showFilter?: boolean
}

export default function PageTopBar({ title, action, showFilter = true }: PageTopBarProps) {
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