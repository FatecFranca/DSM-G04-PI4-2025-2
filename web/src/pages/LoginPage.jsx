import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

/**
 * Página de Login integrada com backend
 */
const LoginPage = ({ onNavigate }) => {
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    credencial: '' // PIN (funcionário) ou Senha (gerente)
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!formData.email || !formData.credencial) {
      setLocalError('Email e credencial são obrigatórios')
      return
    }

    try {
      await login(formData.email, formData.credencial)
      
      // Redirecionar para homepage após login bem-sucedido
      onNavigate('home')
    } catch (err) {
      setLocalError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Login</h2>

        {(error || localError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error || localError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Senha 
            </label>
            <Input
              type="password"
              name="credencial"
              value={formData.credencial}
              onChange={handleChange}
              placeholder="Digite sua senha ou PIN"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-neutral-600">
            Não tem uma conta?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors"
            >
              Cadastre-se aqui
            </button>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="w-full px-4 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Home
          </button>
        </div>
      </div>
    </div>
  )
}


export default LoginPage
