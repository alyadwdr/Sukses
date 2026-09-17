import Modal from '@/components/Modal/Modal'

interface ConfirmModalProps {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Hapus',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel}>
      <h2 style={{ color: 'var(--color-text)', marginBottom: 10 }}>{title}</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>{description}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer' }}
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: danger ? 'var(--color-danger)' : 'var(--color-primary-solid)',
            color: 'var(--color-on-danger)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}