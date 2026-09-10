import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar/Sidebar'
import Topbar from '@/components/Topbar/Topbar'

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ flex: 1, padding: '0 24px 24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}