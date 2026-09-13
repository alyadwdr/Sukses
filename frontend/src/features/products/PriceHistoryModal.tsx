import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/Modal/Modal'

interface PriceHistoryRow {
  id: string
  old_purchase_price: number | null
  new_purchase_price: number | null
  old_selling_price: number | null
  new_selling_price: number | null
  changed_at: string
}

function formatRupiah(value: number | null) {
  return value === null ? '-' : `Rp${value.toLocaleString('id-ID')}`
}

export default function PriceHistoryModal({ productId, productName, onClose }: { productId: string; productName: string; onClose: () => void }) {
  const [rows, setRows] = useState<PriceHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('changed_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRows(data)
        setLoading(false)
      })
  }, [productId])

  return (
    <Modal onClose={onClose}>
      <h2 style={{ color: 'var(--color-text)', marginBottom: 4 }}>Riwayat Harga</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>{productName}</p>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Memuat...</p>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Belum ada perubahan harga tercatat.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '8px 10px', fontSize: 12, color: 'var(--color-text-muted)' }}>Tanggal</th>
              <th style={{ padding: '8px 10px', fontSize: 12, color: 'var(--color-text-muted)' }}>Harga Beli</th>
              <th style={{ padding: '8px 10px', fontSize: 12, color: 'var(--color-text-muted)' }}>Harga Jual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '10px' }}>{new Date(row.changed_at).toLocaleDateString('id-ID')}</td>
                <td style={{ padding: '10px' }}>
                  {formatRupiah(row.old_purchase_price)} → <strong>{formatRupiah(row.new_purchase_price)}</strong>
                </td>
                <td style={{ padding: '10px' }}>
                  {formatRupiah(row.old_selling_price)} → <strong>{formatRupiah(row.new_selling_price)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  )
}