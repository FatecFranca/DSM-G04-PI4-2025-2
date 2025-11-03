import { useState } from 'react'
import Button from '../common/Button'
import { useAuth } from '../../hooks/useAuth'

const NavBar = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { user, isAuthenticated, logout, isGerente } = useAuth()

  const menuItems = [
    { id: 'home', label: 'Início', href: 'home' },
    { id: 'solutions', label: 'Soluções', href: 'solutions' }
  ]

  const handleMenuClick = (id) => {
    setActiveSection(id)
    setIsMenuOpen(false)
    onNavigate?.(id)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    onNavigate?.('home')
  }

  // Obter o primeiro nome do usuário para exibição
  const firstName = user?.nome?.split(' ')[0] || 'Usuário'

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">ClickServe</h1>
                  <p className="text-xs text-neutral-500 hidden sm:block">Gestão Inteligente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-neutral-600 px-3 py-1 bg-neutral-50 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <span className="font-semibold">{firstName}</span>
                    {user.cargo && (
                      <span className="text-xs text-neutral-500 ml-1">({user.cargo})</span>
                    )}
                  </span>
                </div>
                {isGerente && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => handleMenuClick('admin')}>
                      ⚙️ Admin
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleMenuClick('funcionarios')}>
                      👥 Funcionários
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleMenuClick('dashboard')}>
                  📊 Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleMenuClick('login')}>
                  Entrar
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleMenuClick('register')}>
                  Registre-se
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="sr-only">Abrir menu principal</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-neutral-200">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile Action Buttons */}
            <div className="pt-4 pb-3 border-t border-neutral-200">
              {isAuthenticated && user && (
                <div className="px-3 pb-3 mb-3 border-b border-neutral-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-5 h-5 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-neutral-900">{user.nome}</p>
                      {user.cargo && (
                        <p className="text-xs text-neutral-500 capitalize">{user.cargo}</p>
                      )}
                      {user.email && (
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {isAuthenticated && user ? (
                  <>
                    {isGerente && (
                      <>
                        <Button variant="ghost" fullWidth onClick={() => handleMenuClick('admin')}>
                          ⚙️ Painel Admin
                        </Button>
                        <Button variant="ghost" fullWidth onClick={() => handleMenuClick('funcionarios')}>
                          👥 Funcionários
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" fullWidth onClick={() => handleMenuClick('dashboard')}>
                      📊 Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      fullWidth 
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" fullWidth onClick={() => handleMenuClick('login')}>
                      Entrar
                    </Button>
                    <Button variant="primary" fullWidth onClick={() => handleMenuClick('register')}>
                      Começar Grátis
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar