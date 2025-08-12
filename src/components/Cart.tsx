import { DeleteOutlined } from '@ant-design/icons'
import { Button, InputNumber, Typography, Divider, Space, Card, Row, Col, Tag, Tooltip } from 'antd'
import { useMemo } from 'react'

const { Text } = Typography

type Line = {
  nomenclature: number
  unit: number
  price: number
  quantity: number
  discount?: number
  sum_discounted?: number
  name?: string
}

type LineErr = { price?: string; quantity?: string; discount?: string; sum_discounted?: string }

export default function Cart({
  rows,
  onChange,
  currency = '₽',
  errors,
}: Readonly<{
  rows: Line[]
  onChange: (rows: Line[]) => void
  currency?: string
  errors?: LineErr[]
}>) {
  const set = (idx: number, patch: Partial<Line>) => {
    const next = rows.slice()
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }
  const remove = (idx: number) => {
    const next = rows.slice()
    next.splice(idx, 1)
    onChange(next)
  }

  const lineSum = (r: Line) => {
    const price = Number(r.price) || 0
    const qty = Math.max(1, Number(r.quantity) || 1)
    const disc = Number(r.discount ?? 0) || 0
    const sumDisc = Number(r.sum_discounted ?? 0) || 0
    return price * qty - disc - sumDisc
  }

  const total = useMemo(() => rows.reduce((s, r) => s + lineSum(r), 0), [rows])

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

  return (
    <div className="mt-3">
      {rows.map((r, i) => {
        const err = errors?.[i] ?? {}
        return (
          <Card
            key={`${r.nomenclature}-${i}`}
            size="small"
            className="mb-2"
            styles={{ body: { padding: 12 } }}
            title={
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Text className="block truncate">{r.name ?? `#${r.nomenclature}`}</Text>
                  <Text type="secondary" className="!text-[12px]">ед.: {r.unit}</Text>
                </div>
                <Button
                  type="text"
                  aria-label="Удалить позицию"
                  onClick={() => remove(i)}
                  icon={<DeleteOutlined className="text-red-500" />}
                />
              </div>
            }
            extra={null}
          >
            <Space direction="vertical" size={8} className="w-full">
              <Row gutter={8} align="middle">
                <Col span={12}>
                  <Text type="secondary" className="block !text-[12px] mb-1">Цена</Text>
                  <Tooltip title={err.price} placement="top" trigger={['hover', 'focus']} color="red">
                    <InputNumber
                      size="large"
                      className="w-full"
                      min={0}
                      step={0.01}
                      value={r.price}
                      onChange={(v) => set(i, { price: Number(v) || 0 })}
                      controls={false}
                      placeholder="0.00"
                      status={err.price ? 'error' : undefined}
                    />
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="block !text-[12px] mb-1">Скидка</Text>
                  <Tooltip title={err.discount}  placement="top" trigger={['hover', 'focus']} color="red">
                    <InputNumber
                      size="large"
                      className="w-full"
                      min={0}
                      step={0.01}
                      value={r.discount ?? 0}
                      onChange={(v) => set(i, { discount: Number(v) || 0 })}
                      controls={false}
                      placeholder="0.00"
                      status={err.discount ? 'error' : undefined}
                    />
                  </Tooltip>
                </Col>
              </Row>

              <Row gutter={8} align="middle">
                <Col span={12}>
                  <Text type="secondary" className="block !text-[12px] mb-1">Кол-во</Text>
                  <Tooltip title={err.quantity}  placement="top" trigger={['hover', 'focus']} color="red">
                    <InputNumber
                      size="large"
                      className="w-full"
                      min={1}
                      step={1}
                      value={r.quantity}
                      onChange={(v) => set(i, { quantity: Math.max(1, Number(v) || 1) })}
                      controls
                      status={err.quantity ? 'error' : undefined}
                    />
                  </Tooltip>
                </Col>
                <Col span={12} className="flex items-end justify-end">
                  <div className="text-right">
                    <Text type="secondary" className="block !text-[12px]">Итого</Text>
                    <Tag className="!mt-1 !text-base !py-1 !px-2" color="blue">
                      {fmt(lineSum(r))} {currency}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>
        )
      })}

      <Divider className="!my-3" />

      <div className="flex items-center justify-between px-1">
        <Text strong>Итого</Text>
        <Text strong>{fmt(total)} {currency}</Text>
      </div>
    </div>
  )
}
