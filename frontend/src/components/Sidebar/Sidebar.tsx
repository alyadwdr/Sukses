import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Package,
  Boxes,
  Wallet,
  TrendingUp,
  BarChart3,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useBusiness } from '@/context/BusinessContext'
import { useAuth } from '@/context/AuthContext'
import { useSidebar } from '@/context/SidebarContext'

const menuGroups = [
  {
    label: 'Ringkasan',
    items: [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Produk & Stok',
    items: [
      { label: 'Produk', path: '/dashboard/products', icon: Package, end: false },
      { label: 'Inventori', path: '/dashboard/inventory', icon: Boxes, end: false },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { label: 'Transaksi', path: '/dashboard/transactions', icon: Receipt, end: false },
      { label: 'Pengeluaran', path: '/dashboard/expenses', icon: Wallet, end: false },
      { label: 'Pemasukan', path: '/dashboard/income', icon: TrendingUp, end: false },
      { label: 'Laporan', path: '/dashboard/reports', icon: BarChart3, end: false },
    ],
  },
  {
    label: 'Lainnya',
    items: [{ label: 'Pengaturan', path: '/dashboard/settings', icon: SettingsIcon, end: false }],
  },
]

export default function Sidebar() {
  const { business } = useBusiness()
  const { session } = useAuth()
  const { collapsed, toggleCollapsed, width } = useSidebar()

  const email = session?.user.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        background: 'var(--color-card)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s ease',
        zIndex: 30,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px 16px', overflowY: 'auto', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: 24,
            paddingLeft: collapsed ? 0 : 8,
          }}
        >
          {!collapsed && (
            <h2 style={{ color: 'var(--color-text)', fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {business?.name ?? 'Sukses'}
            </h2>
          )}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {menuGroups.map((group, groupIndex) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            {collapsed ? (
              groupIndex > 0 && (
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 4px 12px' }} />
              )
            ) : (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  padding: '0 12px',
                  marginBottom: 8,
                }}
              >
                {group.label}
              </div>
            )}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    style={({ isActive }) => ({
                      padding: collapsed ? '10px 0' : '10px 12px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      color: isActive ? '#fff' : 'var(--color-text)',
                      background: isActive ? 'var(--color-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: 10,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    })}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: collapsed ? '14px 0' : '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
        }}
        title={collapsed ? email : undefined}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {initials || '?'}
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {email}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}