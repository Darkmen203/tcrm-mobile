import { Modal, Form, Input, DatePicker, message } from 'antd'
import dayjs from 'dayjs'
import { api } from '@/api/client'

export default function CreateClientModal({
  open, onClose, onCreated,
}: Readonly<{
  open: boolean
  onClose: () => void
  onCreated: (c: { id:number; name:string; phone?:string }) => void
}>) {
  const [form] = Form.useForm()

  const handleOk = async () => {
    const v = await form.validateFields()
    const payload = {
      name: v.name,
      phone: v.phone,
      inn: v.inn || null,
      comment: v.comment || null,
      birthday: v.birthday ? dayjs(v.birthday).unix() : null,
    }
    const { data } = await api.post('/api/v1/contragents/', payload)
    message.success('Контрагент создан')
    onCreated({ id: data.id, name: data.name, phone: data.phone })
    onClose()
    form.resetFields()
  }

  return (
    <Modal open={open} title="Редактирование контрагента" onCancel={onClose} onOk={handleOk} okText="Сохранить" destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item label="Имя контрагента" name="name" rules={[{ required:true, message:'Укажите имя' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Номер контрагента" name="phone" rules={[{ required:true, message:'Укажите телефон' }]}>
          <Input inputMode="tel" />
        </Form.Item>
        <Form.Item label="ИНН контрагента" name="inn"><Input /></Form.Item>
        <Form.Item label="Примечание" name="comment"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item label="Дата рождения" name="birthday"><DatePicker format="DD-MM-YYYY" className="w-full" /></Form.Item>
      </Form>
    </Modal>
  )
}
