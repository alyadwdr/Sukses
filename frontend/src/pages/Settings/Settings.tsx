import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useBusiness } from '@/context/BusinessContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
}

export default function Settings() {
  const { session } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { business, updateBusiness } = useBusiness()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (business) {
      setName(business.name)
      setAddress(business.address ?? '')
      setPhone(business.phone ?? '')
    }
  }, [business])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await updateBusiness({ name, address: address || null, phone: phone || null } as any)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const email = session?.user.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <div>
      <PageTopBar title="Pengaturan" showFilter={false} />

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Card style={{ boxShadow: 'var(--shadow-card)', maxWidth: 480, flex: 1, minWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'var(--color-accent)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{email}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Akun Pengguna</div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--color-border)', marginBottom: 20 }} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--color-bg)',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Tampilan
              </div>
              <div style={{ fontWeight: 700 }}>{theme === 'dark' ? 'Tema Gelap' : 'Tema Terang'}</div>
            </div>
            <div
              style={{
                display: 'inline-flex',
                padding: 3,
                borderRadius: 20,
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                style={{
                  padding: '6px 14px',
                  borderRadius: 16,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: theme === 'light' ? 'var(--color-primary)' : 'transparent',
                  color: theme === 'light' ? '#fff' : 'var(--color-text)',
                }}
              >
                Terang
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                style={{
                  padding: '6px 14px',
                  borderRadius: 16,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: theme === 'dark' ? 'var(--color-primary)' : 'transparent',
                  color: theme === 'dark' ? '#fff' : 'var(--color-text)',
                }}
              >
                Gelap
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 14,
              border: 'none',
              background: '#e74c3c',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Keluar
          </button>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', maxWidth: 480, flex: 1, minWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Store size={20} color="var(--color-text-muted)" />
            <h3>Informasi Bisnis</h3>
          </div>

          <form onSubmit={handleSaveBusiness} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>
                Nama Bisnis
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>
                Alamat Toko
              </label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Opsional" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>
                Nomor Telepon
              </label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opsional" style={inputStyle} />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: 12,
                borderRadius: 10,
                border: 'none',
                background: saved ? '#27ae60' : 'var(--color-primary)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 6,
              }}
            >
              {saving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan Perubahan'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 12 }}>
            Nama bisnis ini otomatis muncul di sidebar, halaman login, dan sebagai judul laporan PDF. Alamat & telepon dipakai sebagai kop laporan.
          </p>
        </Card>
      </div>
    </div>
  )
}