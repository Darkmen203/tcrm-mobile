import { useEffect, useState } from 'react'
import { Select, Spin, Typography, Empty } from 'antd'
import { fetchClients, type Client } from '@/api/clients'

const { Text } = Typography

export default function PhoneSearch({
  label = 'Контрагент',
  value, onChange, refreshKey, error,
}: Readonly<{
  label?: string
  value?: number
  onChange: (id: number | undefined) => void
  refreshKey?: number
  error?: string
}>) {
  const [options, setOptions] = useState<{ value: number; label: string }[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data: Client[] = await fetchClients({ limit: 300 })
      setOptions(data.map(c => ({ value: c.id, label: `${c.name}${c.phone ? ` — ${c.phone}` : ''}` })))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [refreshKey])

  return (
    <div className="mb-3">
      <Text className="block !mb-1" type="secondary">{label}</Text>
      <Select
        className="w-full"
        showSearch
        allowClear
        placeholder="Поиск по телефону/имени…"
        value={value}
        onChange={(v) => onChange(typeof v === 'number' ? v : undefined)}
        options={options}
        optionFilterProp="label"
        filterOption={(input, o) => (o?.label as string).toLowerCase().includes(input.toLowerCase())}
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : (
          <div className="p-3">
            <Empty description="Не найдено" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
        virtual
        status={error ? 'error' : undefined}
        aria-invalid={!!error}
      />
    </div>
  )
}
