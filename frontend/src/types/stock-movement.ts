export interface StockMovement {
  id: string
  product_id: string
  change: number
  reason: 'sale' | 'stock_in' | 'adjustment'
  created_at: string
}