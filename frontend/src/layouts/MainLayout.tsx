import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar/Sidebar'

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  )
}