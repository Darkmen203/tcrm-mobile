import { api } from './client'
import type { SalePayload } from '@/types/sale'

export type CreatedDoc =
  | { id?: number; number?: string | number }
  | { result?: Array<{ id?: number; number?: string | number }> }

export async function createSale(payload: SalePayload) {
  const { data } = await api.post<CreatedDoc>('/api/v1/docs_sales/', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export function extractDocLabel(resp: CreatedDoc): string | undefined {
  const first =
    (Array.isArray(resp?.result) && resp.result[0]) ? resp.result[0] : (resp as unknown)
  const num = first?.number ?? first?.id
  return typeof num === 'number' || typeof num === 'string' ? String(num) : undefined
}