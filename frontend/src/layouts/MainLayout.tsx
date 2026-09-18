import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar/Sidebar'
import TopRightControls from '@/components/TopRightControls/TopRightControls'
import BottomNav from '@/components/BottomNav/BottomNav'
import MoreMenuSheet from '@/components/MoreMenuSheet/MoreMenuSheet'
import { useSidebar } from '@/context/SidebarContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MoreMenuProvider, useMoreMenu } from '@/context/MoreMenuContext'

function MobileLayout() {
  const { open, closeMore } = useMoreMenu()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <main style={{ padding: '20px 16px 84px' }}>
        <Outlet />
      </main>
      <BottomNav />
      <MoreMenuSheet open={open} onClose={closeMore} />
    </div>
  )
}

export default function MainLayout() {
  const { width } = useSidebar()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <MoreMenuProvider>
        <MobileLayout />
      </MoreMenuProvider>
    )
  }

  return (
    <MoreMenuProvider>
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
    </MoreMenuProvider>
  )
}