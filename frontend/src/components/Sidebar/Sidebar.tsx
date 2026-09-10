import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Package,
  Boxes,
  Wallet,
  TrendingUp,
  BarChart3,
  Bell,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useNotifications } from '@/features/notifications/useNotifications'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', path: '/dashboard/transactions', icon: Receipt },
  { label: 'Products', path: '/dashboard/products', icon: Package },
  { label: 'Inventory', path: '/dashboard/inventory', icon: Boxes },
  { label: 'Expenses', path: '/dashboard/expenses', icon: Wallet },
  { label: 'Income', path: '/dashboard/income', icon: TrendingUp },
  { label: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const { notifications } = useNotifications()

  return (
    <aside
      style={{
        width: 240,
        padding: '20px 16px',
        background: 'var(--color-card)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div>
        <h2 style={{ color: 'var(--color-text)', marginBottom: 28, paddingLeft: 8 }}>Sukses</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                style={({ isActive }) => ({
                  padding: '10px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'var(--color-text)',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 14,
                })}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={18} />
                  {item.label}
                </span>
                {item.label === 'Notifications' && notifications.length > 0 && (
                  <span
                    style={{
                      background: '#e74c3c',
                      color: '#fff',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 10,
                    }}
                  >
                    {notifications.length}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}