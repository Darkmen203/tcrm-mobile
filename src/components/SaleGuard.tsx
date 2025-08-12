import { Navigate } from "react-router-dom"

export function SaleGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = localStorage.getItem('tcrm_token')
  if (!token) return <Navigate to="/" replace />
  return children
}