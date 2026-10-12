import type { Product } from '@/types/product'
import type { ProductUnit } from '@/types/productUnit'

// Baris satuan yang sedang diisi di form, urut dari terbesar ke terkecil.
// Baris terakhir (terkecil/base) tidak punya breakdownQty.
export interface UnitRowInput {
  unitName: string
  breakdownQty: string
  purchasePrice: string
  sellingPrice: string
}

export interface FlattenedUnit {
  unit_name: string
  factor_to_base: number
  purchase_price: number
  selling_price: number
  sort_order: number
}

// Ratakan input berjenjang ("1 ikat = 5 pak", "1 pak = 100 lembar") jadi faktor-ke-base per baris.
export function flattenUnitRows(rows: UnitRowInput[]): FlattenedUnit[] {
  const n = rows.length
  const factors: number[] = new Array(n)
  factors[n - 1] = 1
  for (let i = n - 2; i >= 0; i--) {
    factors[i] = Number(rows[i].breakdownQty || 0) * factors[i + 1]
  }
  return rows.map((row, i) => ({
    unit_name: row.unitName,
    factor_to_base: factors[i],
    purchase_price: Number(row.purchasePrice || 0),
    selling_price: Number(row.sellingPrice || 0),
    sort_order: i,
  }))
}

// Semua satuan sebuah produk, termasuk base unit-nya sendiri, urut terbesar -> terkecil.
export function allUnitsForProduct(product: Product, extraUnits: ProductUnit[]): FlattenedUnit[] {
  const sortedExtra = [...extraUnits].sort((a, b) => a.sort_order - b.sort_order)
  return [
    ...sortedExtra.map((u) => ({
      unit_name: u.unit_name,
      factor_to_base: u.factor_to_base,
      purchase_price: u.purchase_price,
      selling_price: u.selling_price,
      sort_order: u.sort_order,
    })),
    {
      unit_name: product.unit,
      factor_to_base: 1,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      sort_order: sortedExtra.length,
    },
  ]
}

// Pecah stok base-unit jadi kombinasi satuan besar->kecil, buat tampilan ringkas.
export function stockBreakdown(baseStock: number, units: FlattenedUnit[]): string {
  const baseUnit = units[units.length - 1]
  let remaining = baseStock
  const parts: string[] = []

  for (const u of units) {
    if (u.factor_to_base <= 1) continue
    const count = Math.floor(remaining / u.factor_to_base)
    if (count > 0) {
      parts.push(`${count} ${u.unit_name}`)
      remaining -= count * u.factor_to_base
    }
  }

  if (remaining > 0 || parts.length === 0) parts.push(`${remaining} ${baseUnit.unit_name}`)
  return parts.join(' ')
}