export type CategoryFilterValue = 'all' | 'plastik' | 'sembako'

export function filterItemsByCategory<T extends { products: { category: string } }>(
  items: T[],
  filter: CategoryFilterValue
): T[] {
  if (filter === 'all') return items
  return items.filter((item) => item.products.category === filter)
}