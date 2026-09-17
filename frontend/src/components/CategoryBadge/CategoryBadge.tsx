export default function CategoryBadge({ category }: { category: string }) {
  const isPlastik = category === 'plastik'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
        background: isPlastik ? 'var(--color-badge-plastik-bg)' : 'var(--color-badge-sembako-bg)',
        color: isPlastik ? 'var(--color-badge-plastik-text)' : 'var(--color-badge-sembako-text)',
      }}
    >
      {category}
    </span>
  )
}