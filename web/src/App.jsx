import { useState } from 'react'
import { RegisterForm, LoginForm, NavBar } from './components'
import Dashboard from './pages/Dashboard'
import AdminPage from './pages/AdminPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'login', 'register', 'dashboard' or 'admin'

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar onNavigate={setCurrentPage} />
        <AdminPage onBackToHome={() => setCurrentPage('home')} />
      </div>
    )
  }

  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar onNavigate={setCurrentPage} />
        <Dashboard onBackToHome={() => setCurrentPage('home')} />
      </div>
    )
  }

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
      
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <header className="text-center py-16 md:py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
            </svg>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-neutral-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-blue-600 to-secondary-600">
            DrinkFlow
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-4 font-medium">
            Gestão Inteligente de Bebidas
          </p>
          
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Sistema completo para controlar estoque, vendas e relatórios de forma intuitiva e segura. Perfeito para restaurantes, bares e estabelecimentos comerciais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button 
              onClick={() => setCurrentPage('login')}
              className="btn-secondary px-8 py-4 text-lg font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Fazer Login
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="btn-primary px-8 py-4 text-lg font-semibold rounded-full hover:shadow-xl transition-all transform hover:scale-105"
            >
              Criar Conta Grátis
            </button>
          </div>
          
          <p className="text-sm text-neutral-500">
            ✓ Sem cartão de crédito • ✓ Acesso imediato • ✓ Suporte 24/7
          </p>
        </header>

        {/* Features Grid */}
        <div className="py-12 md:py-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              Funcionalidades Principais
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Tudo que você precisa para gerenciar
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Ferramentas poderosas e simples para otimizar seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Card 1 */}
            <div className="card group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 group-hover:from-primary-600 group-hover:to-primary-700 rounded-2xl flex items-center justify-center mb-6 transition-all">
                <svg className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Gestão de Estoque
              </h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Controle completo do seu inventário de bebidas com alertas automáticos e relatórios em tempo real
              </p>
              <button onClick={() => setCurrentPage('dashboard')} className="btn-primary w-full rounded-full hover:shadow-lg transition-all font-semibold">
                Explorar →
              </button>
            </div>

            {/* Card 2 */}
            <div className="card group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary-100 to-secondary-200 group-hover:from-secondary-600 group-hover:to-secondary-700 rounded-2xl flex items-center justify-center mb-6 transition-all">
                <svg className="w-7 h-7 text-secondary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Análise de Vendas
              </h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Gráficos intuitivos e dashboards que mostram o desempenho em tempo real do seu estabelecimento
              </p>
              <button onClick={() => setCurrentPage('dashboard')} className="btn-accent w-full rounded-full hover:shadow-lg transition-all font-semibold">
                Explorar →
              </button>
            </div>

            {/* Card 3 */}
            <div className="card group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-accent-100 to-accent-200 group-hover:from-accent-600 group-hover:to-accent-700 rounded-2xl flex items-center justify-center mb-6 transition-all">
                <svg className="w-7 h-7 text-accent-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Relatórios Inteligentes
              </h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Geração automática de relatórios detalhados para ajudar na tomada de decisão estratégica
              </p>
              <button onClick={() => setCurrentPage('dashboard')} className="btn-secondary w-full rounded-full hover:shadow-lg transition-all font-semibold">
                Explorar →
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-12 md:py-20">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl border border-primary-400 p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de estabelecimentos que já estão otimizando suas operações com DrinkFlow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setCurrentPage('register')}
                className="px-8 py-4 bg-white text-primary-600 font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all"
              >
                Começar Grátis Agora
              </button>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-primary-600 transition-all"
              >
                Ver Demo
              </button>
            </div>
            <p className="text-primary-100 text-sm mt-6">
              Sem cartão de crédito necessário. Comece gratuitamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
