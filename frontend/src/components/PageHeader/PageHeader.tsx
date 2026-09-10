import type { ReactNode } from 'react'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'

interface PageHeaderProps {
  title: string
  action?: ReactNode
  showFilter?: boolean
}

export default function PageHeader({ title, action, showFilter = true }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ color: 'var(--color-text)' }}>{title}</h1>
        {action}
      </div>
      {showFilter && <BusinessFilterTabs />}
    </div>
  )
}