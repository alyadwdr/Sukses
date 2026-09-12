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
} from 'lucide-react'
import { useBusiness } from '@/context/BusinessContext'

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
    items: [
      { label: 'Pengaturan', path: '/dashboard/settings', icon: SettingsIcon, end: false },
    ],
  },
]

export default function Sidebar() {
  const { business } = useBusiness()

  return (
    <aside
      style={{
        width: 240,
        padding: '20px 16px',
        background: 'var(--color-card)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <h2 style={{ color: 'var(--color-text)', marginBottom: 24, paddingLeft: 8 }}>
        {business?.name ?? 'Sukses'}
      </h2>

      {menuGroups.map((group) => (
        <div key={group.label} style={{ marginBottom: 20 }}>
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
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
                </NavLink>
              )
            })}
          </nav>
        </div>
      ))}
    </aside>
  )
}