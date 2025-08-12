import { useEffect, useMemo, useState } from 'react'
import { Modal, Input, Table, Button, Space, Typography, Empty, Breadcrumb } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { fetchCategoriesPage, fetchNomenclaturePage, sumBalance, type NomenclatureItem } from '@/api/products'

const { Text } = Typography

type Row =
  | ({ kind: 'category' } & { id:number; name:string })
  | ({ kind: 'product' } & NomenclatureItem)

type View = 'cats' | 'prods' | 'search'

export default function NomenclaturePicker({
  open, onClose, onPick, warehouseId,
}: Readonly<{
  open: boolean
  onClose: () => void
  onPick: (item: NomenclatureItem) => void
  warehouseId?: number
}>) {
  const [currentParent, setCurrentParent] = useState<number|null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id:number|null; name:string}>>([{ id:null, name:'Категории' }])

  const [view, setView] = useState<View>('cats')
  const [currentCategoryForProds, setCurrentCategoryForProds] = useState<number|undefined>(undefined)

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const [catsPage, setCatsPage] = useState(1)
  const [catsSize, setCatsSize] = useState(9)
  const [catsTotal, setCatsTotal] = useState(0)

  const [prodsPage, setProdsPage] = useState(1)
  const [prodsSize, setProdsSize] = useState(9)
  const [prodsTotal, setProdsTotal] = useState(0)

  const loadCats = async (parent: number|null, page=catsPage, size=catsSize) => {
    setLoading(true)
    try {
      const { items, total } = await fetchCategoriesPage({ parent, limit:size, offset:(page-1)*size })
      setCatsTotal(total)
      setRows(items.map(c => ({ kind:'category', id:c.id, name:c.name })))
      setView('cats')
    } finally { setLoading(false) }
  }

  const loadProds = async (category?: number, page=prodsPage, size=prodsSize, q?: string) => {
    setLoading(true)
    try {
      const { items, total } = await fetchNomenclaturePage({
        category, name: q?.trim() || undefined, warehouseId, limit:size, offset:(page-1)*size
      })
      setProdsTotal(total)
      setRows(items.map(i => ({ kind:'product', ...i })))
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (!open) return
    (async () => {
      setCurrentParent(null)
      setBreadcrumbs([{ id:null, name:'Категории' }])
      setCurrentCategoryForProds(undefined)
      setSearch('')
      setCatsPage(1); setProdsPage(1)
      await loadCats(null, 1, catsSize)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, warehouseId])

  const enterCategory = async (cat: {id:number; name:string}) => {
    setCurrentParent(cat.id)
    setBreadcrumbs(prev => [...prev, { id:cat.id, name:cat.name }])
    setCatsPage(1)
    await loadCats(cat.id, 1, catsSize)
  }

  const viewCategoryProds = async (cat: {id:number; name:string}) => {
    setCurrentCategoryForProds(cat.id)
    setProdsPage(1)
    setView('prods')
    await loadProds(cat.id, 1, prodsSize)
  }

  const goToBreadcrumb = async (idx: number) => {
    const crumb = breadcrumbs[idx]
    const newTrail = breadcrumbs.slice(0, idx+1)
    setBreadcrumbs(newTrail)
    setCurrentParent(crumb.id)
    setCatsPage(1)
    setView('cats')
    await loadCats(crumb.id, 1, catsSize)
  }

  const onBackToCatsRoot = async () => {
    await goToBreadcrumb(0)
  }

  const onDoSearch = async (v: string) => {
    const q = v.trim()
    setSearch(v)
    if (q) {
      setView('search')
      setProdsPage(1)
      await loadProds(undefined, 1, prodsSize, q)
    } else {
      setView('cats')
      setProdsPage(1)
      await loadCats(currentParent ?? null, catsPage, catsSize)
    }
  }

  const columns: ColumnsType<Row> = useMemo(() => [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',

      render: (_, r) => r.kind === 'category' ? <Text strong>{r.name}</Text> : r.name,
    },
    {
      title: 'Остаток',
      key: 'balance',
      width: 110,
      render: (_, r) => r.kind === 'product' ? (sumBalance(r) ?? 0) : '',
    },
    {
      title: 'Единица',
      key: 'unit',
      width: 110,
      render: (_, r) => r.kind === 'product' ? (r.unit_name ?? r.unit) : '',
    },
    {
      title: 'ШК',
      width: 110,
      key: 'barcode',
      ellipsis: true,
      render: (_, r) => r.kind === 'product' ? (r.barcodes?.join(', ') ?? '') : '',
    },
    {
      title: 'Действие',
      key: 'act',
      width: 135,
      fixed: 'right',
      render: (_, r) => r.kind === 'product' ? (
        <Button size="small" onClick={() => onPick(r)}>Добавить</Button>
      ) : (
        <Space size={8}>
          <Button size="small" onClick={() => enterCategory({ id:r.id, name:r.name })}>Войти</Button>
          <Button size="small" type="link" onClick={() => viewCategoryProds({ id:r.id, name:r.name })}>Товары</Button>
        </Space>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [onPick])

  const pagination = view === 'cats'
    ? {
        current: catsPage,
        pageSize: catsSize,
        total: catsTotal,
        showSizeChanger: true,
        onChange: async (p: number, ps: number) => {
          setCatsPage(p); setCatsSize(ps)
          await loadCats(currentParent, p, ps)
        },
      }
    : {
        current: prodsPage,
        pageSize: prodsSize,
        total: prodsTotal,
        showSizeChanger: true,
        onChange: async (p: number, ps: number) => {
          setProdsPage(p); setProdsSize(ps)
          await loadProds(view === 'prods' ? currentCategoryForProds : undefined, p, ps, view === 'search' ? search : undefined)
        },
      }

  return (
    <Modal open={open} onCancel={onClose} title="Выбор номенклатуры" footer={null} width={1000} destroyOnHidden style={{ top: '1%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="flex gap-2 items-center flex-wrap">
          <Breadcrumb>
            {breadcrumbs.map((b, i) => (
              <Breadcrumb.Item key={`${b.id ?? 'root'}-${i}`}>
                <a onClick={() => goToBreadcrumb(i)}>{b.name}</a>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>

          {view !== 'cats' && (
            <Button onClick={onBackToCatsRoot}>К категориям</Button>
          )}

          <Input.Search
            className="flex-1 min-w-[260px]"
            placeholder="Поиск по наименованию / ШК"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={onDoSearch}
          />
        </div>

        {rows.length === 0 && !loading ? (
          <Empty description="Нет данных" />
        ) : (
          <Table<Row>
            size='small'
            rowKey={(r) => (r.kind === 'category' ? `c-${r.id}` : `p-${r.id}`)}
            columns={columns}
            dataSource={rows}
            loading={loading}
            pagination={pagination}
            scroll={{ x: 900 }}
          />
        )}
      </Space>
    </Modal>
  )
}
