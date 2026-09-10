export interface Transaction {
  id: string
  trx_number: string
  payment_method: 'cash' | 'qris' | 'transfer'
  total: number
  created_at: string
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  price_at_sale: number
  subtotal: number
}