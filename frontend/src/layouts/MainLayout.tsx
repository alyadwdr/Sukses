import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar/Sidebar'
import TopRightControls from '@/components/TopRightControls/TopRightControls'
import { useSidebar } from '@/context/SidebarContext'

export default function MainLayout() {
  const { width } = useSidebar()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <TopRightControls />
      <main
        style={{
          marginLeft: width,
          padding: 24,
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}