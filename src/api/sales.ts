import { api } from './client'
import type { SalePayload } from '@/types/sale'

type DocItem = { id?: number; number?: string | number }
type DocList = { result?: DocItem[] }
export type CreatedDoc = DocItem | DocList

export async function createSale(payload: SalePayload) {
  const { data } = await api.post<CreatedDoc>('/api/v1/docs_sales/', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export function extractDocLabel(resp: CreatedDoc): string | undefined {
  let num: string | number | undefined

  if ('result' in resp && Array.isArray(resp.result) && resp.result.length > 0) {
    const first = resp.result[0]
    num = first?.number ?? first?.id
  } else {
    const single = resp as DocItem
    num = single.number ?? single.id
  }

  return typeof num === 'number' || typeof num === 'string' ? String(num) : undefined
}
