import { useAuth } from '../hooks/useAuth'

/**
 * Componente para rotas protegidas por autenticação
 */
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.cargo !== requiredRole) {
    return null
  }

  return children
}

export default PrivateRoute
