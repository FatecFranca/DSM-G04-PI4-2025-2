import { useState } from 'react'
import StatCard from '../components/charts/StatCard'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'

const AdminPage = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'users', 'products', 'orders', 'settings'
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Mock data - substituir por dados reais da API
  const stats = {
    totalUsers: 1248,
    totalOrders: 3567,
    totalRevenue: 125840,
    activeUsers: 342,
    pendingOrders: 23,
    completedToday: 89
  }

  const userGrowthData = [
    { name: 'Jan', value: 120 },
    { name: 'Fev', value: 195 },
    { name: 'Mar', value: 240 },
    { name: 'Abr', value: 310 },
    { name: 'Mai', value: 385 },
    { name: 'Jun', value: 498 }
  ]

  const userTypeData = [
    { label: 'Clientes', value: 892 },
    { label: 'Garçons', value: 156 },
    { label: 'Cozinha', value: 87 },
    { label: 'Administradores', value: 13 }
  ]

  const salesByCategory = [
    { name: 'Bebidas', value: 45200 },
    { name: 'Comidas', value: 38500 },
    { name: 'Sobremesas', value: 22100 },
    { name: 'Outros', value: 20040 }
  ]

  // Dados de usuários mockados
  const recentUsers = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', role: 'Cliente', status: 'active', joinDate: '2025-10-15' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', role: 'Garçom', status: 'active', joinDate: '2025-10-14' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', role: 'Cliente', status: 'inactive', joinDate: '2025-10-13' },
    { id: 4, name: 'Ana Oliveira', email: 'ana@email.com', role: 'Cozinha', status: 'active', joinDate: '2025-10-12' },
    { id: 5, name: 'Carlos Souza', email: 'carlos@email.com', role: 'Admin', status: 'active', joinDate: '2025-10-10' }
  ]

  const recentOrders = [
    { id: '#ORD-1001', customer: 'João Silva', table: 'Mesa 5', amount: 245.50, status: 'completed', date: '2025-10-18 14:30' },
    { id: '#ORD-1002', customer: 'Maria Santos', table: 'Mesa 3', amount: 189.00, status: 'pending', date: '2025-10-18 14:25' },
    { id: '#ORD-1003', customer: 'Pedro Costa', table: 'Mesa 8', amount: 412.80, status: 'processing', date: '2025-10-18 14:20' },
    { id: '#ORD-1004', customer: 'Ana Oliveira', table: 'Mesa 2', amount: 156.00, status: 'completed', date: '2025-10-18 14:15' },
    { id: '#ORD-1005', customer: 'Carlos Souza', table: 'Mesa 7', amount: 298.90, status: 'cancelled', date: '2025-10-18 14:10' }
  ]

  const products = [
    { id: 1, name: 'Cerveja Artesanal IPA', category: 'Bebidas', price: 18.90, stock: 145, status: 'active' },
    { id: 2, name: 'Hambúrguer Gourmet', category: 'Comidas', price: 35.00, stock: 67, status: 'active' },
    { id: 3, name: 'Cheesecake', category: 'Sobremesas', price: 22.50, stock: 12, status: 'low-stock' },
    { id: 4, name: 'Vinho Tinto Reserva', category: 'Bebidas', price: 89.00, stock: 3, status: 'critical' },
    { id: 5, name: 'Pizza Margherita', category: 'Comidas', price: 45.00, stock: 89, status: 'active' }
  ]

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800 border border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border border-blue-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
      'low-stock': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      critical: 'bg-red-100 text-red-800 border border-red-200'
    }
    return badges[status] || badges.active
  }

  const getStatusText = (status) => {
    const texts = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
      processing: 'Processando',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      'low-stock': 'Estoque Baixo',
      critical: 'Crítico'
    }
    return texts[status] || status
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600 mt-1">Gerenciamento completo do sistema</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="quarter">Último Trimestre</option>
                <option value="year">Último Ano</option>
              </select>

              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Relatório
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Visão Geral', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'users', label: 'Usuários', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'products', label: 'Produtos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { id: 'orders', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
              { id: 'settings', label: 'Configurações', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total de Usuários"
                value={stats.totalUsers.toLocaleString()}
                trend="up"
                change="+12.5%"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Pedidos Totais"
                value={stats.totalOrders.toLocaleString()}
                trend="up"
                change="+8.3%"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              />
              <StatCard
                title="Receita Total"
                value={`R$ ${stats.totalRevenue.toLocaleString()}`}
                trend="up"
                change="+15.8%"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Usuários Ativos"
                value={stats.activeUsers.toLocaleString()}
                trend="up"
                change="+5.2%"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChart
                data={userGrowthData}
                title="Crescimento de Usuários"
                dataKey="value"
                nameKey="name"
              />
              <PieChart
                data={userTypeData}
                title="Distribuição de Usuários"
                dataKey="value"
                nameKey="label"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <PieChart
                data={salesByCategory}
                title="Vendas por Categoria"
                dataKey="value"
                nameKey="name"
                type="donut"
              />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h2>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Novo Usuário
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Todos os Tipos</option>
                <option value="client">Cliente</option>
                <option value="waiter">Garçom</option>
                <option value="kitchen">Cozinha</option>
                <option value="admin">Administrador</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">{user.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                        <button className="text-red-600 hover:text-red-900">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Produtos</h2>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Novo Produto
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Todas as Categorias</option>
                <option value="bebidas">Bebidas</option>
                <option value="comidas">Comidas</option>
                <option value="sobremesas">Sobremesas</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="low-stock">Estoque Baixo</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock} un.</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(product.status)}`}>
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                        <button className="text-red-600 hover:text-red-900">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Pedidos</h2>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtros
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Atualizar
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.table}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">R$ {order.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-4">Ver Detalhes</button>
                        <button className="text-blue-600 hover:text-blue-900">Imprimir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Estabelecimento</label>
                    <input type="text" defaultValue="DrinkFlow Restaurant" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contato</label>
                    <input type="email" defaultValue="contato@drinkflow.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input type="tel" defaultValue="(11) 98765-4321" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <textarea rows={3} defaultValue="Rua Exemplo, 123 - Centro, São Paulo - SP" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
                <div className="space-y-4">
                  {[
                    { id: 'email-orders', label: 'Notificar novos pedidos por email', checked: true },
                    { id: 'email-low-stock', label: 'Alertas de estoque baixo', checked: true },
                    { id: 'email-reports', label: 'Relatórios diários por email', checked: false },
                    { id: 'sms-orders', label: 'SMS para pedidos urgentes', checked: true },
                    { id: 'push-notifications', label: 'Notificações push no navegador', checked: true }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <label htmlFor={item.id} className="text-sm text-gray-700">{item.label}</label>
                      <input
                        type="checkbox"
                        id={item.id}
                        defaultChecked={item.checked}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Segurança</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Autenticação de Dois Fatores</label>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Ativado
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sessões Ativas</label>
                    <p className="text-sm text-gray-600 mb-2">3 dispositivos conectados</p>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Gerenciar Sessões
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alterar Senha</label>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Modificar Senha
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
                <div className="space-y-4">
                  {[
                    { id: 'cash', label: 'Dinheiro', enabled: true },
                    { id: 'credit', label: 'Cartão de Crédito', enabled: true },
                    { id: 'debit', label: 'Cartão de Débito', enabled: true },
                    { id: 'pix', label: 'PIX', enabled: true },
                    { id: 'voucher', label: 'Vale Refeição', enabled: false }
                  ].map((method) => (
                    <div key={method.id} className="flex items-center justify-between">
                      <label htmlFor={method.id} className="text-sm text-gray-700">{method.label}</label>
                      <input
                        type="checkbox"
                        id={method.id}
                        defaultChecked={method.enabled}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Salvar Alterações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
