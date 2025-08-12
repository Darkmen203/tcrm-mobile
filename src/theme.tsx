import { ConfigProvider, App as AntApp, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import React from 'react'

export function AppThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          colorInfo: '#3b82f6',
          colorSuccess: '#22c55e',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',

          borderRadius: 12,
          fontSize: 14,
          controlHeightLG: 42,

          colorBgLayout: '#f7f9fb',
          colorBorder: 'rgba(0,0,0,0.12)',
        },
        components: {
          Button: { borderRadius: 12, controlHeight: 40, controlHeightLG: 44 },
          Input: { borderRadius: 10, controlHeight: 40 },
          Select: { borderRadius: 10, controlHeight: 40 },
          Card: { borderRadiusLG: 16 },
          Modal: { borderRadiusLG: 16 },
          Tag: { borderRadiusSM: 10 },
        },
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  )
}
