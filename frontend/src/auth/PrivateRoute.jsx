import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return null // ou um loader se preferir

  return isAuthenticated
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />
}
