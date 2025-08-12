import { useEffect, useMemo, useState } from 'react'
import { Select, Spin, Typography, Button, Empty } from 'antd'
import type { DefaultOptionType } from 'antd/es/select'
import { fetchNomenclaturePage, sumBalance, type NomenclatureItem } from '@/api/products'

const { Text } = Typography

type NomOption = DefaultOptionType & {
    value: number
    label: string
    _raw: NomenclatureItem
}

export default function NomenclatureQuickSearch({
    label = 'Поиск номенклатуры',
    warehouseId,
    onPick,
    onOpenPicker,
    error,
}: Readonly<{
    label?: string
    warehouseId?: number
    onPick: (item: NomenclatureItem) => void
    onOpenPicker: () => void,
    error?: boolean
}>) {
    const [loading, setLoading] = useState(false)
    const [all, setAll] = useState<NomenclatureItem[]>([])
    const [value, setValue] = useState<number | undefined>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const { items } = await fetchNomenclaturePage({
                    warehouseId: warehouseId ?? 0,
                    limit: 50,
                    offset: 0,
                })
                setAll(items)
            } finally { setLoading(false) }
        }
        load()
    }, [warehouseId])

    const options: NomOption[] = useMemo(() => {
        return all.map((i): NomOption => {
            const bal = sumBalance(i)
            const unit = i.unit_name ?? i.unit
            return {
                value: i.id,
                label: `${i.name} • Ост: ${bal ?? '—'} • ${unit}`,
                _raw: i,
            }
        })
    }, [all])

    return (
        <div className="mb-3 w-full">
            <div className="flex items-start gap-2 flex-col w-full">
                <div className="flex-1 min-w-0 w-full">
                    <Text className="block !mb-1" type="secondary">{label}</Text>
                    <Select<number, NomOption>
                        className="w-full nqs-select"
                        showSearch
                        allowClear
                        placeholder="Начните вводить наименование/ШК…"
                        value={value}
                        onChange={(v, opt) => {
                            const picked = Array.isArray(opt) ? undefined : opt
                            setValue(typeof v === 'number' ? v : undefined)
                            if (picked?._raw) onPick(picked._raw)
                        }}
                        options={options}
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        loading={loading}
                        notFoundContent={
                            loading ? <Spin size="small" /> : (
                                <div className="p-3">
                                    <Empty description="Ничего не найдено" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                </div>
                            )
                        }
                        popupMatchSelectWidth
                        styles={{
                            popup: {
                                root: {
                                    maxWidth: '100vw'
                                }
                            }
                        }}
                        virtual
                        status={error ? 'error' : undefined}
                        aria-invalid={!!error}
                    />

                </div>

                <Button type="default" onClick={onOpenPicker}>
                    Выбрать
                </Button>
            </div>
        </div>
    )
}
