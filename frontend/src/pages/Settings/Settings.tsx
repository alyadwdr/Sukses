import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useBusiness } from '@/context/BusinessContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Store, Moon, Sun, LogOut } from 'lucide-react'
import Card from '@/components/Card/Card'

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

const labelStyle = {
  fontSize: 12,
  color: 'var(--color-text-muted)',
  marginBottom: 6,
  display: 'block',
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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      <h1 style={{ color: 'var(--color-text)', marginBottom: 20 }}>Pengaturan</h1>

      <Card
        style={{
          boxShadow: 'var(--shadow-card)',
          background: 'var(--color-text)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{business?.name ?? 'Sukses'}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  letterSpacing: 0.5,
                }}
              >
                PEMILIK
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              aria-label="Tema terang"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: theme === 'light' ? '#fff' : 'transparent',
                color: theme === 'light' ? 'var(--color-text)' : 'rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Sun size={15} />
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              aria-label="Tema gelap"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: theme === 'dark' ? '#fff' : 'transparent',
                color: theme === 'dark' ? 'var(--color-text)' : 'rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Moon size={15} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 20,
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

      <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Store size={20} color="var(--color-primary)" />
          <h3 style={{ fontSize: 17 }}>Profil Bisnis & Laporan</h3>
        </div>

        <form onSubmit={handleSaveBusiness} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Nama Bisnis</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={labelStyle}>Nomor Telepon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opsional" style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={labelStyle}>Alamat Lengkap</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Opsional" style={inputStyle} />
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 32px',
                borderRadius: 12,
                border: 'none',
                background: saved ? '#27ae60' : 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {saving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}