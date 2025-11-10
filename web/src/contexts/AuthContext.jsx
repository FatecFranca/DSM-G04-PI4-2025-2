import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import ApiService from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
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

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated,
    isGerente
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
