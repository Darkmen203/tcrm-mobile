export interface RefItem { id: number; name: string }

export interface ApiItem { count: number; results: RefItem[] }


export interface NomenclatureItem {
  id: number
  name: string
  unit: number
  unit_name?: string | null
  prices: Array<{ price_type?: number; price?: number }>
  balances?: Array<{ warehouse_name: string; current_amount: number }>
}
