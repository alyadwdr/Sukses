import { useCallback, useState } from 'react'
import type { Product } from '@/types/product'
import type { ProductUnit } from '@/types/productUnit'
import { allUnitsForProduct, type FlattenedUnit } from '@/lib/units'

// Per-baris pilihan satuan tampilan (bukan disimpan ke database, cuma buat tabel Produk/Inventori).
export function useUnitSelector(unitsByProduct: (productId: string) => ProductUnit[]) {
  const [selection, setSelection] = useState<Record<string, string>>({})

  const unitsFor = useCallback(
    (p: Product): FlattenedUnit[] => allUnitsForProduct(p, unitsByProduct(p.id)),
    [unitsByProduct]
  )

  const selectedUnitFor = useCallback(
    (p: Product): FlattenedUnit => {
      const units = unitsFor(p)
      const chosen = selection[p.id]
      return units.find((u) => u.unit_name === chosen) ?? units[units.length - 1]
    },
    [unitsFor, selection]
  )

  // Stok dibulatkan ke bawah per satuan yang sedang aktif -- bukan pecahan satuan besar + sisa.
  const stockQtyFor = useCallback(
    (p: Product): number => {
      const units = unitsFor(p)
      if (units.length <= 1) return p.stock
      const unit = selectedUnitFor(p)
      return Math.floor(p.stock / unit.factor_to_base)
    },
    [unitsFor, selectedUnitFor]
  )

  const setUnit = useCallback((productId: string, unitName: string) => {
    setSelection((prev) => ({ ...prev, [productId]: unitName }))
  }, [])

  return { unitsFor, selectedUnitFor, stockQtyFor, setUnit }
}