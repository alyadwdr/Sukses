import { NavLink } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'

const menuItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Products', path: '/products' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Income', path: '/income' },
  { label: 'Reports', path: '/reports' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside
      style={{
        width: 220,
        padding: '16px',
        background: 'var(--color-card, var(--color-base))',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <h2 style={{ color: 'var(--color-dark)', marginBottom: 24 }}>Sukses</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'var(--color-dark)',
                background: isActive ? 'var(--color-primary)' : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button onClick={toggleTheme} style={{ padding: '8px 12px', borderRadius: 8 }}>
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
    </aside>
  )
}