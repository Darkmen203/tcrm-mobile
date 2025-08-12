import { api } from '@/api/client'

export type CategoryNode = {
  key: number
  name: string
  parent: number | null
  children?: CategoryNode[]
}

export type NomenclatureItem = {
  id: number
  name: string
  unit: number
  unit_name?: string
  barcodes?: string[]
  balances?: { warehouse_name: string; current_amount: number }[]
}

export type ApiListResponse<T> = { result: T[]; count: number }

export type FetchNomenclatureOpts = {
  category?: number
  name?: string
  warehouseId?: number
  limit?: number
  offset?: number
}

export type NomenclatureQuery = {
  category?: number
  name?: string
  with_prices: boolean
  with_balance: boolean
  in_warehouse: number
  limit: number
  offset: number
}


let _treeCache: CategoryNode[] | null = null

async function loadTreeSafe(): Promise<CategoryNode[]> {
  if (_treeCache) return _treeCache
  try {
    const { data } = await api.get<{ result: CategoryNode[] }>('/api/v1/categories_tree/')
    _treeCache = data.result ?? []
  } catch {
    _treeCache = []
  }
  return _treeCache
}

function getLevel(tree: CategoryNode[], parent: number | null): CategoryNode[] {
  if (parent === null) return tree
  const stack = [...tree]
  while (stack.length) {
    const n = stack.pop()!
    if (n.key === parent) return n.children ?? []
    if (n.children?.length) stack.push(...n.children)
  }
  return []
}

export async function fetchCategoriesPage(opts: {
  parent: number | null
  limit?: number
  offset?: number
}): Promise<{ items: { id: number; name: string }[]; total: number }> {
  const { parent, limit = 20, offset = 0 } = opts
  const tree = await loadTreeSafe()
  const level = getLevel(tree, parent)
  const total = level.length
  const slice = level.slice(offset, offset + limit)
  return {
    items: slice.map(c => ({ id: c.key, name: c.name })),
    total,
  }
}


export async function fetchNomenclaturePage(
  opts: FetchNomenclatureOpts = {},
): Promise<{ items: NomenclatureItem[]; total: number }> {
  const {
    category,
    name,
    warehouseId = 0,
    limit = 20,
    offset = 0,
  } = opts

  const params = {
    with_prices: true,
    with_balance: true,
    in_warehouse: warehouseId,
    limit,
    offset,
    ...(typeof category === 'number' ? { category } : {}),
    ...(name && name.trim() ? { name: name.trim() } : {}),
  } satisfies NomenclatureQuery

  const { data } = await api.get<ApiListResponse<NomenclatureItem>>(
    '/api/v1/nomenclature/',
    { params },
  )

  return { items: data.result, total: data.count }
}

export function sumBalance(n: NomenclatureItem) {
  if (!n.balances?.length) return 0
  return n.balances.reduce((s, b) => s + (Number(b.current_amount) || 0), 0)
}
