import type { NomenclatureItem } from "@/types/refs"

export function pickPrice(item: NomenclatureItem, priceTypeId?: number): number {
  if (!item.prices || item.prices.length === 0) return 0
  if (!priceTypeId) {
    const first = item.prices.find(p => typeof p.price === 'number')
    return first?.price ?? 0
  }
  const match = item.prices.find(p => (p).price_type === priceTypeId)
  return match?.price ?? 0
}

export function balanceForWarehouse(item: NomenclatureItem, warehouseName?: string): number | undefined {
  if (!item.balances || !item.balances.length) return undefined
  if (!warehouseName) {
    return item.balances.reduce((s, b) => s + (b.current_amount ?? 0), 0)
  }
  return item.balances
    .filter(b => b.warehouse_name === warehouseName)
    .reduce((s, b) => s + (b.current_amount ?? 0), 0)
}