import { useForm } from 'react-hook-form'
import { useState } from 'react'
import Button from '../common/Button'
import Footer from '../common/Footer'
import ApiService from '../../services/api'

const RegisterForm = ({ onBackToLogin, onBackToHome, onNavigate }) => {
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      cnpj: '',
      businessType: 'Restaurante'
    }
  })

  const watchPassword = watch('password')

  const businessTypes = [
    { value: 'Restaurante', label: 'Restaurante' },
    { value: 'Bar', label: 'Bar' },
    { value: 'Cafeteria', label: 'Cafeteria' },
    { value: 'Outro', label: 'Outro' }
  ]

  // Máscaras de formatação
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }

  const onSubmit = async (data) => {
    try {
      setErrorMessage('')
      setSuccessMessage('')
      
      // Chamar API de registro de empresa
      const response = await ApiService.createEmpresa({
        nomeCompleto: data.name,
        email: data.email,
        cpf: data.cpf,
        senha: data.password,
        confirmarSenha: data.confirmPassword,
        nomeEmpresa: data.businessName,
        tipo: data.businessType,
        cnpj: data.cnpj
      })
      
      setSuccessMessage('Conta criada com sucesso! Redirecionando...')
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        onNavigate?.('login') || onBackToLogin()
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      setErrorMessage(error.message || 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBackToHome}
            className="flex items-center text-neutral-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar à página inicial
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">ClickServe</h1>
          <p className="text-neutral-600">Crie sua conta e comece a gerenciar seu estabelecimento</p>
        </div>

        {/* Form */}
        <div className="form-container">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                placeholder="Digite seu nome completo"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
                type="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="seu@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                CPF <span className="text-red-500">*</span>
              </label>
              <input
                {...register('cpf', {
                  required: 'CPF é obrigatório',
                  minLength: { value: 11, message: 'CPF deve ter 11 dígitos' }
                })}
                type="text"
                className={`input-field ${errors.cpf ? 'input-error' : ''}`}
                placeholder="000.000.000-00"
                maxLength="14"
                onChange={(e) => {
                  e.target.value = formatCPF(e.target.value)
                }}
              />
              {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>}
            </div>

            {/* Nome do Estabelecimento */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nome do Estabelecimento <span className="text-red-500">*</span>
              </label>
              <input
                {...register('businessName', {
                  required: 'Nome do estabelecimento é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                className={`input-field ${errors.businessName ? 'input-error' : ''}`}
                placeholder="Nome do seu restaurante/bar"
              />
              {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>}
            </div>

            {/* CNPJ */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                CNPJ <span className="text-red-500">*</span>
              </label>
              <input
                {...register('cnpj', {
                  required: 'CNPJ é obrigatório',
                  minLength: { value: 14, message: 'CNPJ deve ter 14 dígitos' }
                })}
                type="text"
                className={`input-field ${errors.cnpj ? 'input-error' : ''}`}
                placeholder="00.000.000/0000-00"
                maxLength="18"
                onChange={(e) => {
                  e.target.value = formatCNPJ(e.target.value)
                }}
              />
              {errors.cnpj && <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>}
            </div>

            {/* Tipo de Estabelecimento */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tipo de Estabelecimento
              </label>
              <select
                {...register('businessType')}
                className="input-field"
              >
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Senha <span className="text-red-500">*</span>
              </label>
              <input
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                })}
                type="password"
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                placeholder="Digite uma senha segura"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirmar Senha <span className="text-red-500">*</span>
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: value => value === watchPassword || 'As senhas não coincidem'
                })}
                type="password"
                className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Digite a senha novamente"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              fullWidth
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Já tem uma conta?{' '}
              <button 
                onClick={onBackToLogin}
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>

        <Footer 
          variant="compact" 
          showBackToHome={true} 
          onBackToHome={onBackToHome} 
        />
      </div>
    </div>
  )
}

export default RegisterForm
