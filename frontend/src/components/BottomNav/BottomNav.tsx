import { NavLink, useLocation } from 'react-router-dom'
import { Home, Package, ShoppingBag, Boxes, Grid2x2 } from 'lucide-react'
import { useMoreMenu } from '@/context/MoreMenuContext'

const tabs = [
  { label: 'Beranda', path: '/dashboard', icon: Home, end: true },
  { label: 'Produk', path: '/dashboard/products', icon: Package, end: false },
  { label: 'Transaksi', path: '/dashboard/transactions', icon: ShoppingBag, end: false },
  { label: 'Stok', path: '/dashboard/inventory', icon: Boxes, end: false },
]

const moreRoutes = ['/dashboard/expenses', '/dashboard/income', '/dashboard/reports', '/dashboard/settings']

export default function BottomNav() {
  const { openMore } = useMoreMenu()
  const location = useLocation()
  const isMoreActive = moreRoutes.some((r) => location.pathname.startsWith(r))

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        background: 'var(--color-card)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 14,
                    background: isActive ? 'var(--color-primary-tint)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={19} />
                </span>
                {tab.label}
              </>
            )}
          </NavLink>
        )
      })}
      <button
        onClick={openMore}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          border: 'none',
          background: 'transparent',
          color: isMoreActive ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
          fontSize: 11,
          fontWeight: isMoreActive ? 600 : 400,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span
          style={{
            width: 44,
            height: 26,
            borderRadius: 14,
            background: isMoreActive ? 'var(--color-primary-tint)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Grid2x2 size={19} />
        </span>
        Lainnya
      </button>
    </nav>
  )
}