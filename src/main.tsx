import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import TokenScreen from '@/screens/TokenScreen'
import SaleScreen from '@/screens/SaleScreen'
import { SaleGuard } from './components/SaleGuard'
import { AppThemeProvider } from './theme'
import 'antd/dist/reset.css'
import './index.css'

const qc = new QueryClient()

const router = createBrowserRouter([
  { path: '/', element: <TokenScreen /> },
  { path: '/sale', element: <SaleGuard><SaleScreen/></SaleGuard> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppThemeProvider>
  </StrictMode>,
)