import { useEffect, useState } from 'react'
import Card from '@/components/Card/Card'
import Modal from '@/components/Modal/Modal'
import type { TransactionRow } from './useTransactions'

interface Props {
  transaction: TransactionRow
  highlighted?: boolean
}

const MAX_VISIBLE_ITEMS = 3

function ItemRow({ item }: { item: TransactionRow['transaction_items'][number] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 10,
        fontSize: 14,
        marginBottom: 6,
        alignItems: 'baseline',
      }}
    >
      <span>{item.products.name}</span>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
        {item.quantity} x Rp{item.price_at_sale.toLocaleString('id-ID')}
      </span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>Rp{item.subtotal.toLocaleString('id-ID')}</span>
    </div>
  )
}

function PlaceholderRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 10,
        fontSize: 14,
        marginBottom: 6,
        visibility: 'hidden',
      }}
    >
      <span>&nbsp;</span>
      <span>&nbsp;</span>
      <span>&nbsp;</span>
    </div>
  )
}

export default function ReceiptCard({ transaction, highlighted }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [showOutline, setShowOutline] = useState(!!highlighted)

  useEffect(() => {
    if (highlighted) {
      setShowOutline(true)
      const timer = setTimeout(() => setShowOutline(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [highlighted])

  const totalItems = transaction.transaction_items.reduce((sum, item) => sum + item.quantity, 0)
  const displayTotal = transaction.transaction_items.reduce((sum, item) => sum + item.subtotal, 0)

  const visibleItems = transaction.transaction_items.slice(0, MAX_VISIBLE_ITEMS)
  const hasMore = transaction.transaction_items.length > MAX_VISIBLE_ITEMS
  const placeholderCount = Math.max(0, MAX_VISIBLE_ITEMS - visibleItems.length)

  return (
    <div
      id={`receipt-${transaction.trx_number}`}
      style={{
        borderRadius: 20,
        outline: showOutline ? '3px solid var(--color-primary)' : '3px solid transparent',
        outlineOffset: 2,
        transition: 'outline-color 1.2s ease',
      }}
    >
      <Card style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-card)' }}>
        <div style={{ fontWeight: 600 }}>{transaction.trx_number}</div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12 }}>
          {new Date(transaction.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
          })}
        </div>

        {visibleItems.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <PlaceholderRow key={`ph-${i}`} />
        ))}

        <div style={{ textAlign: 'center', marginTop: 4, marginBottom: 4, minHeight: 20 }}>
          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Lihat Semua ({transaction.transaction_items.length} item)
            </button>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 4, paddingTop: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{totalItems} Item</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginTop: 4 }}>
            <span>Total</span>
            <span>Rp{displayTotal.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: 4 }}>
            {transaction.payment_method === 'cash' ? 'Tunai' : transaction.payment_method}
          </div>

          {transaction.notes && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px dashed var(--color-border)',
                fontSize: 13,
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
              }}
            >
              "{transaction.notes}"
            </div>
          )}
        </div>
      </Card>

      {showAll && (
        <Modal onClose={() => setShowAll(false)}>
          <h2 style={{ color: 'var(--color-text)', marginBottom: 4 }}>{transaction.trx_number}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>
            {new Date(transaction.created_at).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Jakarta',
            })}
          </p>

          {transaction.transaction_items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{totalItems} Item</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 4 }}>
              <span>Total</span>
              <span>Rp{displayTotal.toLocaleString('id-ID')}</span>
            </div>
            {transaction.notes && (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                "{transaction.notes}"
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}