import { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import LoginForm from './components/LoginForm'
import NavBar from './components/NavBar'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'login', 'register' or 'dashboard'

  if (currentPage === 'register') {
    return (
      <RegisterForm 
        onBackToLogin={() => setCurrentPage('login')} 
        onBackToHome={() => setCurrentPage('home')}
      />
    )
  }

  if (currentPage === 'login') {
    return (
      <LoginForm 
        onBackToRegister={() => setCurrentPage('register')}
        onBackToHome={() => setCurrentPage('home')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50">
      <NavBar onNavigate={setCurrentPage} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-neutral-900 mb-6">
            ClickServe
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Sistema inteligente de gestão de bebidas para restaurantes, bares e estabelecimentos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
              onClick={() => setCurrentPage('login')}
              className="btn-secondary px-8 py-3"
            >
              Entrar
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="btn-primary px-8 py-3"
            >
              Criar Conta Grátis
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card 1 */}
            <div className="card">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Gestão de Estoque
              </h3>
              <p className="text-neutral-600 mb-4">
                Controle completo do seu inventário de bebidas com relatórios em tempo real
              </p>
              <button className="btn-primary w-full">
                Acessar Estoque
              </button>
            </div>

            {/* Card 2 */}
            <div className="card">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Vendas
              </h3>
              <p className="text-neutral-600 mb-4">
                Registre e acompanhe suas vendas com dashboards intuitivos
              </p>
              <button className="btn-accent w-full">
                Ver Vendas
              </button>
            </div>

            {/* Card 3 */}
            <div className="card">
              <div className="w-12 h-12 bg-gradient-to-r from-accent-600 to-accent-700 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Relatórios
              </h3>
              <p className="text-neutral-600 mb-4">
                Análises detalhadas para otimizar seu negócio
              </p>
              <button className="btn-secondary w-full">
                Ver Relatórios
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Pronto para começar?
              </h3>
              <p className="text-neutral-600 mb-6">
                Crie sua conta e comece a gerenciar seu estabelecimento hoje mesmo
              </p>
              <button 
                onClick={() => setCurrentPage('register')}
                className="btn-primary w-full"
              >
                Criar Conta Grátis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
