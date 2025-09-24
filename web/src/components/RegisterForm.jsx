import { useForm } from 'react-hook-form'
import Button from './Button'
import Footer from './Footer'

const RegisterForm = ({ onBackToLogin, onBackToHome }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      businessName: '',
      businessType: 'restaurant'
    }
  })

  const watchPassword = watch('password')

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'bar', label: 'Bar' },
    { value: 'cafe', label: 'Café' },
    { value: 'pub', label: 'Pub' },
    { value: 'club', label: 'Clube Noturno' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'other', label: 'Outro' }
  ]

  const onSubmit = async (data) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Dados do formulário:', data)
      alert('Conta criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      alert('Erro ao criar conta. Tente novamente.')
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">DrinkFlow</h1>
          <p className="text-neutral-600">Crie sua conta e comece a gerenciar seu estabelecimento</p>
        </div>

        {/* Form */}
        <div className="form-container">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone', {
                  required: 'Telefone é obrigatório',
                  pattern: {
                    value: /^[\d\s\(\)\-\+]+$/,
                    message: 'Telefone inválido'
                  }
                })}
                type="tel"
                className={`input-field ${errors.phone ? 'input-error' : ''}`}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
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