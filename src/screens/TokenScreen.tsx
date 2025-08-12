import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Card, Typography, Input, Button, Space } from 'antd'

export default function TokenScreen() {
  const [token, setToken] = useState(import.meta.env.VITE_API_TOKEN ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const nav = useNavigate()

  const continueFlow = async () => {
    setError(undefined); setLoading(true)
    try {
      localStorage.setItem('tcrm_token', token.trim())
      await api.get('/api/v1/organizations/')
      nav('/sale')
    } catch (e) {
      setError('Неверный токен или нет доступа')
      console.error(e)
      localStorage.removeItem('tcrm_token')
    } finally { setLoading(false) }
  }

  return (
    <div className="app-container">
      <Card className="section-card" title="Авторизация по токену">
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Input.Password
            placeholder="Вставьте токен"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            size="large"
          />
          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            disabled={!token.trim()}
            onClick={continueFlow}
          >
            Продолжить
          </Button>
          {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </Space>
      </Card>
    </div>
  )
}
