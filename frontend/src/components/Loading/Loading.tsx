export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 14,
      }}
    >
      Memuat...
    </div>
  )
}