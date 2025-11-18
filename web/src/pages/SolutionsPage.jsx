import { useState } from 'react'
import Button from '../components/common/Button'
import NavBar from '../components/layout/NavBar'

const SolutionsPage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('restaurant')

  const solutions = {
    restaurant: {
      title: 'Restaurantes',
      description: 'Solução completa para gestão de restaurantes',
      features: [
        {
          title: 'Cardápio Digital',
          description: 'Gerencie seu cardápio de forma digital e atualizada em tempo real'
        },
        {
          title: 'Chamados Inteligentes',
          description: 'Sistema de chamados via botão ESP32 para atendimento rápido'
        },
        {
          title: 'Controle de Mesas',
          description: 'Gestão completa de mesas, pedidos e contas'
        },
        {
          title: 'Relatórios Detalhados',
          description: 'Análises de vendas, produtos mais vendidos e desempenho'
        }
      ],
      benefits: [
        'Redução de 40% no tempo de atendimento',
        'Aumento de 30% na satisfação do cliente',
        'Controle total do estoque',
        'Redução de erros em pedidos'
      ]
    },
    bar: {
      title: 'Bares',
      description: 'Gestão especializada para bares e pubs',
      features: [
        {
          title: 'Gestão de Bebidas',
          description: 'Controle completo de estoque de bebidas e drinks'
        },
        {
          title: 'Happy Hour',
          description: 'Configure promoções e horários especiais automaticamente'
        },
        {
          title: 'Gerenciamento de Equipe',
          description: 'Controle de garçons, bartenders e cozinheiros'
        },
        {
          title: 'Comandas Digitais',
          description: 'Sistema de comandas digitais para maior controle'
        }
      ],
      benefits: [
        'Controle preciso de estoque de bebidas',
        'Redução de perdas e desperdícios',
        'Agilidade no atendimento',
        'Relatórios de vendas por período'
      ]
    },
    cafe: {
      title: 'Cafeterias',
      description: 'Solução otimizada para cafeterias e cafés',
      features: [
        {
          title: 'Produtos Especiais',
          description: 'Gestão de cafés especiais, doces e salgados'
        },
        {
          title: 'Atendimento Rápido',
          description: 'Sistema otimizado para alto volume de pedidos rápidos'
        },
        {
          title: 'Pagamentos Ágeis',
          description: 'Integração com múltiplas formas de pagamento'
        },
        {
          title: 'Analytics',
          description: 'Acompanhe horários de pico e produtos favoritos'
        }
      ],
      benefits: [
        'Atendimento 50% mais rápido',
        'Controle de ingredientes e receitas',
        'Gestão de filas inteligente',
        'Fidelização de clientes'
      ]
    }
  }

  const currentSolution = solutions[activeTab]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50">
      {/* NavBar */}
      <NavBar onNavigate={onNavigate} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">
            Soluções para Seu Negócio
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Escolha a solução perfeita para seu estabelecimento. Todas as ferramentas que você precisa em um só lugar.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setActiveTab('restaurant')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === 'restaurant'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Restaurantes
          </button>
          <button
            onClick={() => setActiveTab('bar')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === 'bar'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Bares
          </button>
          <button
            onClick={() => setActiveTab('cafe')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === 'cafe'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Cafeterias
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              {currentSolution.title}
            </h2>
            <p className="text-xl text-neutral-600">
              {currentSolution.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {currentSolution.features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-primary-50 to-neutral-50 rounded-xl hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Benefícios Comprovados
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {currentSolution.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Features Overview */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Fácil de Usar</h3>
            <p className="text-neutral-600">Interface intuitiva que qualquer um pode usar</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">100% Seguro</h3>
            <p className="text-neutral-600">Seus dados protegidos com criptografia avançada</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Super Rápido</h3>
            <p className="text-neutral-600">Performance otimizada para alta demanda</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolutionsPage
