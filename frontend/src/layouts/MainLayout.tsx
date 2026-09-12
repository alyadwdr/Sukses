import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar/Sidebar'
import TopRightControls from '@/components/TopRightControls/TopRightControls'

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <TopRightControls />
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}