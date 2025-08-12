import { useState, useMemo } from 'react'
import { Select, Typography, Spin } from 'antd'

const { Text } = Typography

export type RefItem = { id: number; name: string }

type Props<T extends RefItem> = {
  label: string
  items: T[]
  value?: number
  onChange: (v: number) => void
  placeholder?: string
  loading?: boolean
  onSearch?: (q: string) => void
  allowClear?: boolean
  disabled?: boolean
  error?: string
}

function useDebouncedCallback(cb?: (q: string)=>void, delay = 400) {
  const [t, setT] = useState<number | undefined>()
  return (q: string) => {
    if (!cb) return
    if (t) window.clearTimeout(t)
    const id = window.setTimeout(()=> cb(q), delay)
    setT(id)
  }
}

export default function RefSelect<T extends RefItem>({
  label, items, value, onChange, placeholder = 'Выберите…',
  loading, onSearch, allowClear = true, disabled, error
}: Readonly<Props<T>>) {

  const debouncedSearch = useDebouncedCallback(onSearch, 400)
  const options = useMemo(() => items.map(i => ({ value: i.id, label: i.name })), [items])

  return (
    <div className="mb-4">
      <Text className="block !mb-1" type="secondary">{label}</Text>
      <Select
        className="w-full"
        showSearch
        allowClear={allowClear}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(v) => typeof v === 'number' && onChange(v)}
        options={options}
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        onSearch={debouncedSearch}
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : null}
        optionFilterProp="label"
        virtual
        status={error ? 'error' : undefined}
        aria-invalid={!!error}
      />
    </div>
  )
}
