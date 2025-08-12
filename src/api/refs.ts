import { useQuery } from '@tanstack/react-query'
import { api } from './client'

type RefApiItem = { id: number; short_name?: string; name?: string }
type RefResp<T> = { result: T[]; count: number }

const hasToken = () => !!localStorage.getItem('tcrm_token')

export const useOrganizations = (name?: string) =>
  useQuery({
    queryKey: ['organizations', name ?? ''],
    enabled: hasToken(),
    queryFn: async () => {
      const { data } = await api.get<RefResp<RefApiItem>>('/api/v1/organizations/', { params: { name } })
      return (data?.result ?? []).map(i => ({ id: i.id, name: i.short_name || i.name || String(i.id) }))
    },
    staleTime: 300_000,
  })

export const useWarehouses = (name?: string) =>
  useQuery({
    queryKey: ['warehouses', name ?? ''],
    enabled: hasToken(),
    queryFn: async () => {
      const { data } = await api.get<RefResp<RefApiItem>>('/api/v1/warehouses/', { params: { name } })
      return (data?.result ?? []).map(i => ({ id: i.id, name: i.short_name || i.name || String(i.id) }))
    },
    staleTime: 300_000,
  })

export const usePayboxes = (name?: string) =>
  useQuery({
    queryKey: ['payboxes', name ?? ''],
    enabled: hasToken(),
    queryFn: async () => {
      const { data } = await api.get<RefResp<RefApiItem>>('/api/v1/payboxes/', { params: { name } })
      return (data?.result ?? []).map(i => ({ id: i.id, name: i.short_name || i.name || String(i.id) }))
    },
    staleTime: 300_000,
  })

export const usePriceTypes = () =>
  useQuery({
    queryKey: ['price_types'],
    enabled: hasToken(),
    queryFn: async () => {
      const { data } = await api.get<RefResp<{ id:number; name:string }>>('/api/v1/price_types/')
      return data?.result ?? []
    },
    staleTime: 300_000,
  })
