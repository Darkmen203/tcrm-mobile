import { api } from '@/api/client'

export interface Client {
  id: number
  name: string
  phone?: string
}

export async function fetchClients(opts?: { phone?: string; limit?: number }) {
  const { phone, limit = 50 } = opts ?? {}
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (phone?.trim()) params.set('phone', phone.trim())

  const { data } = await api.get<{ result: Client[]; count: number }>(
    '/api/v1/contragents/',
    { params }
  )
  return data?.result ?? []
}
