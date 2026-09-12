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
        background: isPlastik ? 'var(--color-accent)' : 'rgba(149, 177, 238, 0.25)',
        color: isPlastik ? 'var(--color-text)' : 'var(--color-primary)',
      }}
    >
      {category}
    </span>
  )
}