import { useState, useCallback } from 'react'
import ApiService from '../services/api'

/**
 * Hook para autenticação
 * Gerencia login, logout e estado do usuário
 */
export const useAuth = () => {
  const [user, setUser] = useState(() => ApiService.getLoggedUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, credencial) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.login(email, credencial)
      setUser(response.user)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    ApiService.logout()
    setUser(null)
    setError(null)
  }, [])

  const isAuthenticated = !!user
  const isGerente = user?.cargo === 'gerente'

  return {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated,
    isGerente
  }
}
 