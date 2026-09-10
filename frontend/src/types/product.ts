export interface Product {
  id: string
  name: string
  category: 'sembako' | 'plastik'
  sku: string | null
  purchase_price: number
  selling_price: number
  unit: string
  stock: number
  min_stock: number
  image_url: string | null
  created_at: string
}