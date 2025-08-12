import { Modal, Form, Input, Radio, Select, message } from 'antd'
import { api } from '@/api/client'

export default function CreateNomenclatureModal({
  open, onClose, onCreated,
}: Readonly<{
  open: boolean
  onClose: () => void
  onCreated: (n: { id:number; name:string; unit:number; unit_name?:string }) => void
}>) {
  const [form] = Form.useForm()
  const handleOk = async () => {
    const v = await form.validateFields()
    const payload = {
      name: v.name,
      type: v.type,
      description_short: v.short || null,
      description_long: v.long || null,
      code: v.code || null,
      unit: v.unit,
      category: v.category || null,
      manufacturer: v.manufacturer || null,
      cashback_type: v.cashback ? 'lcard_cashback' : null,
      cashback_value: v.cashback || null,
    }
    const { data } = await api.post('/api/v1/nomenclature/', payload)
    message.success('Номенклатура создана')
    onCreated({ id: data.id, name: data.name, unit: data.unit, unit_name: data.unit_name })
    onClose()
    form.resetFields()
  }

  return (
    <Modal open={open} title="Добавить номенклатуру" onCancel={onClose} onOk={handleOk} okText="Подтвердить" destroyOnClose>
      <Form form={form} layout="vertical" initialValues={{ type:'product' }}>
        <Form.Item label="Имя" name="name" rules={[{ required:true, message:'Укажите имя' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Тип" name="type">
          <Radio.Group>
            <Radio.Button value="product">Товар</Radio.Button>
            <Radio.Button value="service">Услуга</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Краткое описание" name="short"><Input.TextArea rows={2} /></Form.Item>
        <Form.Item label="Длинное описание" name="long"><Input.TextArea rows={4} /></Form.Item>
        <Form.Item label="Код" name="code"><Input /></Form.Item>
        <Form.Item label="Единица измерения" name="unit" rules={[{ required:true, message:'Выберите единицу' }]}>
          <Select options={[
            { value: 43, label: 'Килограмм' },
            { value: 1, label: 'Штука' },
          ]} />
        </Form.Item>
        <Form.Item label="Категория" name="category"><Select allowClear showSearch /></Form.Item>
        <Form.Item label="Производитель" name="manufacturer"><Input /></Form.Item>
        <Form.Item label="Кешбек" name="cashback"><Input inputMode="decimal" /></Form.Item>
      </Form>
    </Modal>
  )
}
