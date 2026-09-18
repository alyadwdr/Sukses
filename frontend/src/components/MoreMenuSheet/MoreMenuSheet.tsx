import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, BarChart3, Settings as SettingsIcon, ChevronRight } from 'lucide-react'

interface MoreMenuSheetProps {
  open: boolean
  onClose: () => void
}

const items = [
  { label: 'Pengeluaran', description: 'Catat biaya operasional', path: '/dashboard/expenses', icon: Wallet },
  { label: 'Pemasukan', description: 'Pantau uang masuk', path: '/dashboard/income', icon: TrendingUp },
  { label: 'Laporan', description: 'Lihat performa bisnis', path: '/dashboard/reports', icon: BarChart3 },
  { label: 'Pengaturan', description: 'Akun dan preferensi', path: '/dashboard/settings', icon: SettingsIcon },
]

export default function MoreMenuSheet({ open, onClose }: MoreMenuSheetProps) {
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 20px 28px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-divider)' }} />
        </div>

        <h2 style={{ color: 'var(--color-text)', marginBottom: 4, fontSize: 20 }}>Menu Lainnya</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>Akses fitur pembukuan lainnya.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => {
                  onClose()
                  navigate(item.path)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'var(--color-primary-tint)',
                    color: 'var(--color-primary-tint-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{item.description}</div>
                </div>
                <ChevronRight size={18} color="var(--color-text-muted)" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}