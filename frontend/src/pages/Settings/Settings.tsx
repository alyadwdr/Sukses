import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useBusiness } from '@/context/BusinessContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Store, Moon, Sun, LogOut } from 'lucide-react'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
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

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden', width: 320 }}>
          <div style={{ background: 'var(--color-accent)', height: 90 }} />
          <div style={{ padding: '0 24px 24px', marginTop: -45 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                border: '4px solid var(--color-card)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 28,
                margin: '0 auto 12px',
              }}
            >
              {initials}
            </div>

            <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              {email}
            </div>

            <hr style={{ borderColor: 'var(--color-border)', margin: '20px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Tema Tampilan
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{theme === 'dark' ? 'Gelap' : 'Terang'}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  aria-label="Tema terang"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    background: theme === 'light' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: theme === 'light' ? '#fff' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Sun size={16} />
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  aria-label="Tema gelap"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    background: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: theme === 'dark' ? '#fff' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Moon size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 14,
                borderRadius: 14,
                border: 'none',
                background: '#e74c3c',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 340, maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Store size={19} color="var(--color-text-muted)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 2 }}>Informasi Bisnis</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Data untuk kop laporan PDF dan profil toko.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBusiness} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: saved ? '#27ae60' : 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              {saving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan Perubahan'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}