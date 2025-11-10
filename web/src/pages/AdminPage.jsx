import { useState, useEffect } from 'react'
import StatCard from '../components/charts/StatCard'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'
import LineChart from '../components/charts/LineChart'
import ApiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const AdminPage = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'users', 'mesas', 'cardapio', 'chamados', 'relatorios'
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const { user } = useAuth()

  // Estados para dados do backend
  const [funcionarios, setFuncionarios] = useState([])
  const [mesas, setMesas] = useState([])
  const [chamados, setChamados] = useState([])
  const [cardapios, setCardapios] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para relatórios
  const [kpis, setKpis] = useState(null)
  const [previsaoVendas, setPrevisaoVendas] = useState(null)
  const [itensMaisVendidos, setItensMaisVendidos] = useState([])
  const [estatisticasVendas, setEstatisticasVendas] = useState(null)
  const [metodosPagamento, setMetodosPagamento] = useState([])
  const [loadingRelatorios, setLoadingRelatorios] = useState(false)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  // Estados para modal de cadastro de mesa
  const [showMesaModal, setShowMesaModal] = useState(false)
  const [mesaForm, setMesaForm] = useState({
    numero: '',
    id_botao: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Estados para modal de cadastro de produto
  const [showProdutoModal, setShowProdutoModal] = useState(false)
  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: ''
  })

  // Carregar dados do backend
  useEffect(() => {
    loadData()
  }, [])

  // Carregar relatórios quando a tab for selecionada
  useEffect(() => {
    if (activeTab === 'relatorios') {
      loadRelatorios()
    }
  }, [activeTab, dataInicio, dataFim])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [funcData, mesasData, chamadosData, cardapioData] = await Promise.all([
        ApiService.getAllFuncionarios().catch(() => ({ funcionarios: [] })),
        ApiService.getAllMesas().catch(() => ({ mesas: [] })),
        ApiService.getAllChamados().catch(() => ({ chamados: [] })),
        ApiService.getAllCardapios().catch(() => ({ itens: [] }))
      ])

      setFuncionarios(funcData.funcionarios || funcData.users || [])
      setMesas(mesasData.mesas || [])
      setChamados(chamadosData.chamados || [])
      setCardapios(cardapioData.itens || cardapioData.cardapios || [])

      // Tentar carregar dados da empresa
      if (user?.empresa) {
        try {
          const empresaData = await ApiService.getEmpresa(user.empresa)
          setEmpresa(empresaData.empresa)
        } catch (err) {
          console.log('Erro ao carregar empresa:', err)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do sistema')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatorios = async () => {
    setLoadingRelatorios(true)
    try {
      const [
        kpisData,
        previsaoData,
        itensData,
        estatisticasData,
        metodosData
      ] = await Promise.all([
        ApiService.getKPIs(dataInicio, dataFim).catch(() => null),
        ApiService.getPrevisaoVendas(dataInicio, dataFim).catch(() => null),
        ApiService.getItensMaisVendidos().catch(() => []),
        ApiService.getEstatisticasVendas(dataInicio, dataFim).catch(() => null),
        ApiService.getMetodosPagamento(dataInicio, dataFim).catch(() => [])
      ])

      setKpis(kpisData)
      setPrevisaoVendas(previsaoData)
      setItensMaisVendidos(itensData)
      setEstatisticasVendas(estatisticasData)
      setMetodosPagamento(metodosData)
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err)
    } finally {
      setLoadingRelatorios(false)
    }
  }

  // Calcular estatísticas dos dados reais
  const stats = {
    totalUsers: funcionarios.length,
    totalMesas: mesas.length,
    mesasOcupadas: mesas.filter(m => m.ocupada).length,
    chamadosPendentes: chamados.filter(c => c.status === 'pendente').length,
    chamadosAtendidos: chamados.filter(c => c.status === 'resolvido').length,
    activeUsers: funcionarios.filter(f => f.ativo !== false).length
  }

  // Dados para gráficos baseados em dados reais
  const userTypeData = [
    { label: 'Garçons', value: funcionarios.filter(f => f.cargo === 'garcom').length },
    { label: 'Cozinheiros', value: funcionarios.filter(f => f.cargo === 'cozinheiro').length },
    { label: 'Gerentes', value: funcionarios.filter(f => f.cargo === 'gerente').length }
  ]

  const chamadosStatusData = [
    { label: 'Pendentes', value: chamados.filter(c => c.status === 'pendente').length },
    { label: 'Em Atendimento', value: chamados.filter(c => c.status === 'em_atendimento').length },
    { label: 'Resolvidos', value: chamados.filter(c => c.status === 'resolvido').length }
  ]

  const mesasStatusData = [
    { name: 'Disponíveis', value: mesas.filter(m => !m.ocupada).length },
    { name: 'Ocupadas', value: mesas.filter(m => m.ocupada).length }
  ]

  const getStatusBadge = (status) => {
    const badges = {
      ativo: 'bg-green-100 text-green-800 border border-green-200',
      active: 'bg-green-100 text-green-800 border border-green-200',
      inativo: 'bg-gray-100 text-gray-800 border border-gray-200',
      inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
      pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      em_atendimento: 'bg-blue-100 text-blue-800 border border-blue-200',
      processing: 'bg-blue-100 text-blue-800 border border-blue-200',
      resolvido: 'bg-green-100 text-green-800 border border-green-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      cancelado: 'bg-red-100 text-red-800 border border-red-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
      ocupada: 'bg-red-100 text-red-800 border border-red-200',
      disponivel: 'bg-green-100 text-green-800 border border-green-200'
    }
    return badges[status] || badges.active
  }

  const getStatusText = (status) => {
    const texts = {
      ativo: 'Ativo',
      active: 'Ativo',
      inativo: 'Inativo',
      inactive: 'Inativo',
      pendente: 'Pendente',
      pending: 'Pendente',
      em_atendimento: 'Em Atendimento',
      processing: 'Processando',
      resolvido: 'Resolvido',
      completed: 'Concluído',
      cancelado: 'Cancelado',
      cancelled: 'Cancelado',
      ocupada: 'Ocupada',
      disponivel: 'Disponível'
    }
    return texts[status] || status
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatCategoria = (categoria) => {
    const categorias = {
      'bebida': 'Bebidas',
      'prato_principal': 'Pratos Principais',
      'sobremesa': 'Sobremesas',
      'entrada': 'Entradas'
    }
    return categorias[categoria] || categoria
  }

  // Função para criar nova mesa
  const handleCreateMesa = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validações
      if (!mesaForm.numero || !mesaForm.id_botao) {
        throw new Error('Número da mesa e ID do botão são obrigatórios')
      }

      const mesaData = {
        numero: parseInt(mesaForm.numero),
        id_botao: mesaForm.id_botao
      }

      await ApiService.createMesa(mesaData)
      
      // Limpar formulário e fechar modal
      setMesaForm({ numero: '', id_botao: '' })
      setShowMesaModal(false)
      
      // Recarregar dados
      await loadData()
      
      alert('Mesa cadastrada com sucesso!')
    } catch (err) {
      console.error('Erro ao criar mesa:', err)
      setError(err.message || 'Erro ao cadastrar mesa')
    } finally {
      setSubmitting(false)
    }
  }

  // Função para criar novo produto no cardápio
  const handleCreateProduto = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validações
      if (!produtoForm.nome || !produtoForm.preco || !produtoForm.categoria) {
        throw new Error('Nome, preço e categoria são obrigatórios')
      }

      if (parseFloat(produtoForm.preco) <= 0) {
        throw new Error('Preço deve ser maior que zero')
      }

      const produtoData = {
        nome: produtoForm.nome,
        descricao: produtoForm.descricao || '',
        preco: parseFloat(produtoForm.preco),
        categoria: produtoForm.categoria
      }

      const response = await ApiService.createCardapio(produtoData)
      console.log('Produto criado com sucesso:', response)
      
      // Limpar formulário e fechar modal
      setProdutoForm({ nome: '', descricao: '', preco: '', categoria: '' })
      setShowProdutoModal(false)
      
      // Recarregar dados
      await loadData()
      
      alert('Produto cadastrado com sucesso!')
    } catch (err) {
      console.error('Erro completo ao criar produto:', err)
      console.error('Mensagem:', err.message)
      setError(err.message || 'Erro ao cadastrar produto')
    } finally {
      setSubmitting(false)
    }
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
                aria-label="Voltar"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600 mt-1">
                  {empresa ? empresa.nome : 'Gerenciamento completo do sistema'}
                </p>
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
          <div className="flex gap-4 mt-6 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Visão Geral', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'users', label: 'Funcionários', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'mesas', label: 'Mesas', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
              { id: 'cardapio', label: 'Cardápio', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
              { id: 'chamados', label: 'Chamados', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
              { id: 'relatorios', label: 'Relatórios', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
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
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando dados...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
                <button onClick={loadData} className="mt-2 text-red-600 hover:text-red-700 font-medium">
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total de Funcionários"
                    value={stats.totalUsers.toLocaleString()}
                    trend="neutral"
                    change=""
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Total de Mesas"
                    value={stats.totalMesas.toLocaleString()}
                    trend="neutral"
                    change={`${stats.mesasOcupadas} ocupadas`}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Chamados Pendentes"
                    value={stats.chamadosPendentes.toLocaleString()}
                    trend={stats.chamadosPendentes > 5 ? "down" : "neutral"}
                    change={`${stats.chamadosAtendidos} resolvidos`}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Funcionários Ativos"
                    value={stats.activeUsers.toLocaleString()}
                    trend="up"
                    change={`${stats.totalUsers - stats.activeUsers} inativos`}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userTypeData.some(d => d.value > 0) && (
                    <PieChart
                      data={userTypeData}
                      title="Distribuição de Funcionários"
                      dataKey="value"
                      nameKey="label"
                    />
                  )}
                  {chamadosStatusData.some(d => d.value > 0) && (
                    <PieChart
                      data={chamadosStatusData}
                      title="Status dos Chamados"
                      dataKey="value"
                      nameKey="label"
                    />
                  )}
                  {mesasStatusData.some(d => d.value > 0) && (
                    <BarChart
                      data={mesasStatusData}
                      title="Status das Mesas"
                      dataKey="value"
                      nameKey="name"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Funcionários</h2>
              <button 
                onClick={loadData}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando funcionários...</p>
              </div>
            ) : funcionarios.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
                <p className="text-gray-600">Adicione funcionários na página de gerenciamento.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {funcionarios.map((func) => (
                      <tr key={func._id || func.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">{func.nome?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{func.nome}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.cpf || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 capitalize">{func.cargo}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(func.ativo !== false ? 'ativo' : 'inativo')}`}>
                            {getStatusText(func.ativo !== false ? 'ativo' : 'inativo')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {func.createdAt ? new Date(func.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Mesas Tab */}
        {activeTab === 'mesas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Mesas</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowMesaModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nova Mesa
                </button>
                <button 
                  onClick={loadData}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Atualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando mesas...</p>
              </div>
            ) : mesas.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma mesa cadastrada</h3>
                <p className="text-gray-600">Cadastre mesas para começar a gerenciar seu estabelecimento.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID do Botão</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mesas.map((mesa) => (
                      <tr key={mesa._id || mesa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-bold">{mesa.numero}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Mesa {mesa.numero}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                            {mesa.id_botao || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mesa.status === 'livre' ? 'bg-green-100 text-green-800 border border-green-200' :
                            mesa.status === 'ocupada' ? 'bg-red-100 text-red-800 border border-red-200' :
                            mesa.status === 'aguardando_atendimento' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            mesa.status === 'aguardando_pagamento' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {mesa.status === 'livre' ? 'Livre' :
                             mesa.status === 'ocupada' ? 'Ocupada' :
                             mesa.status === 'aguardando_atendimento' ? 'Aguardando Atendimento' :
                             mesa.status === 'aguardando_pagamento' ? 'Aguardando Pagamento' :
                             mesa.status || 'Disponível'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Cardápio Tab */}
        {activeTab === 'cardapio' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Cardápio</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowProdutoModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Produto
                </button>
                <button 
                  onClick={loadData}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Atualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando cardápio...</p>
              </div>
            ) : cardapios.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto cadastrado</h3>
                <p className="text-gray-600">Cadastre produtos para montar o cardápio do seu estabelecimento.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponível</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cardapios.map((produto) => (
                      <tr key={produto._id || produto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-700 font-bold">{produto.nome?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {produto.descricao || 'Sem descrição'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCategoria(produto.categoria)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          R$ {produto.preco?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            produto.disponivel !== false 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {produto.disponivel !== false ? 'Disponível' : 'Indisponível'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {produto.createdAt ? new Date(produto.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Chamados Tab */}
        {activeTab === 'chamados' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Chamados</h2>
              <button 
                onClick={loadData}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando chamados...</p>
              </div>
            ) : chamados.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum chamado registrado</h3>
                <p className="text-gray-600">Chamados aparecem aqui quando clientes solicitam atendimento.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garçom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado Em</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolvido Em</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chamados.map((chamado) => (
                      <tr key={chamado._id || chamado.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-700 font-bold">
                                {chamado.mesa?.numero || chamado.mesa || 'N/A'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Mesa {chamado.mesa?.numero || chamado.mesa || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {chamado.tipo || 'Atendimento'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(chamado.status)}`}>
                            {getStatusText(chamado.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {chamado.garcom?.nome || chamado.garcom || 'Não atribuído'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(chamado.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {chamado.resolvidoEm ? formatDate(chamado.resolvidoEm) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Relatórios Tab */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
              <button 
                onClick={loadRelatorios}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
            </div>

            {/* Filtros de Data */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Período</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                  <input 
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                  <input 
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              {(dataInicio || dataFim) && (
                <button 
                  onClick={() => { setDataInicio(''); setDataFim(''); }}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {loadingRelatorios ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando relatórios...</p>
              </div>
            ) : (
              <>
                {/* KPIs - Cards de Métricas */}
                {kpis && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Indicadores Principais (KPIs)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard
                        title="Faturamento Total"
                        value={`R$ ${kpis.faturamentoTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        trend="neutral"
                        icon={
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                      />
                      <StatCard
                        title="Total de Contas"
                        value={kpis.totalContas?.toLocaleString()}
                        trend="neutral"
                        icon={
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        }
                      />
                      <StatCard
                        title="Ticket Médio"
                        value={`R$ ${kpis.ticketMedio?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        trend="neutral"
                        change={`IC 95%: R$ ${kpis.intervaloConfiancaTicketMedio?.limiteInferior} - R$ ${kpis.intervaloConfiancaTicketMedio?.limiteSuperior}`}
                        icon={
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        }
                      />
                      <StatCard
                        title="Desvio Padrão"
                        value={`R$ ${kpis.desvioPadrao?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        trend="neutral"
                        icon={
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Gráfico de Previsão de Vendas */}
                {previsaoVendas && previsaoVendas.chartData && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Previsão de Vendas</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Análise de tendência com regressão linear (R² = {previsaoVendas.estatisticas?.R_squared})
                    </p>
                    <LineChart 
                      data={previsaoVendas.chartData.labels.map((label, index) => ({
                        data: label,
                        faturamento: previsaoVendas.chartData.data[index]
                      }))}
                      xAxisKey="data"
                      dataKey="faturamento"
                      title=""
                      height={300}
                    />
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Previsão para o Próximo Período</h4>
                      <p className="text-blue-800">
                        {previsaoVendas.previsao?.proximoPeriodoLabel}: 
                        <span className="font-bold ml-2">R$ {parseFloat(previsaoVendas.previsao?.faturamentoPrevisto).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Equação: {previsaoVendas.estatisticas?.equacao}
                      </p>
                    </div>
                  </div>
                )}

                {/* Itens Mais Vendidos */}
                {itensMaisVendidos && itensMaisVendidos.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Top 5 Itens Mais Vendidos</h3>
                    <BarChart 
                      data={itensMaisVendidos.map(item => ({
                        name: item.nomeItem,
                        vendas: item.quantidadeVendida
                      }))}
                      title=""
                      dataKey="vendas"
                      xAxisKey="name"
                      barColor="#10b981"
                    />
                  </div>
                )}

                {/* Grid com Estatísticas e Métodos de Pagamento */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Estatísticas de Vendas */}
                  {estatisticasVendas && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas de Vendas</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Mediana</span>
                          <span className="text-gray-900 font-bold">
                            R$ {estatisticasVendas.mediana?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Moda</span>
                          <span className="text-gray-900 font-bold">
                            {typeof estatisticasVendas.moda === 'number' 
                              ? `R$ ${estatisticasVendas.moda?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : estatisticasVendas.moda}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Assimetria</span>
                          <span className="text-gray-900 font-bold">
                            {estatisticasVendas.assimetria?.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Total de Valores</span>
                          <span className="text-gray-900 font-bold">
                            {estatisticasVendas.totalValores?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                        <p><strong>Interpretação da Assimetria:</strong></p>
                        <p className="mt-1">
                          {estatisticasVendas.assimetria > 0.5 
                            ? '📈 Distribuição assimétrica à direita (valores altos menos frequentes)'
                            : estatisticasVendas.assimetria < -0.5
                            ? '📉 Distribuição assimétrica à esquerda (valores baixos menos frequentes)'
                            : '📊 Distribuição aproximadamente simétrica'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Métodos de Pagamento */}
                  {metodosPagamento && metodosPagamento.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
                      <PieChart 
                        data={metodosPagamento.map(metodo => ({
                          label: metodo.metodo,
                          value: metodo.contagem
                        }))}
                        title=""
                        dataKey="value"
                        nameKey="label"
                      />
                    </div>
                  )}
                </div>

                {/* Mensagem quando não há dados */}
                {!kpis && !previsaoVendas && !itensMaisVendidos?.length && !estatisticasVendas && !metodosPagamento?.length && (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado disponível</h3>
                    <p className="text-gray-600">
                      Não há dados suficientes para gerar relatórios no período selecionado.
                    </p>
                    <p className="text-gray-600 mt-2">
                      Certifique-se de que existem contas finalizadas no sistema.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cadastro de Mesa */}
      {showMesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Cadastrar Nova Mesa</h3>
                <button
                  onClick={() => {
                    setShowMesaModal(false)
                    setMesaForm({ numero: '', id_botao: '' })
                    setError(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateMesa} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da Mesa *
                  </label>
                  <input
                    type="number"
                    value={mesaForm.numero}
                    onChange={(e) => setMesaForm({ ...mesaForm, numero: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: 1, 2, 3..."
                    required
                    min="1"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Botão *
                  </label>
                  <input
                    type="text"
                    value={mesaForm.id_botao}
                    onChange={(e) => setMesaForm({ ...mesaForm, id_botao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: BTN001, BTN002, MESA01..."
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identificador único do botão físico da mesa
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMesaModal(false)
                      setMesaForm({ numero: '', id_botao: '' })
                      setError(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cadastrar Mesa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Produto */}
      {showProdutoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Cadastrar Novo Produto</h3>
                <button
                  onClick={() => {
                    setShowProdutoModal(false)
                    setProdutoForm({ nome: '', descricao: '', preco: '', categoria: '' })
                    setError(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateProduto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={produtoForm.nome}
                    onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Hambúrguer Artesanal"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={produtoForm.descricao}
                    onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descreva o produto..."
                    rows="3"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={produtoForm.preco}
                    onChange={(e) => setProdutoForm({ ...produtoForm, preco: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: 25.90"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={produtoForm.categoria}
                    onChange={(e) => setProdutoForm({ ...produtoForm, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="bebida">Bebidas</option>
                    <option value="prato_principal">Pratos Principais</option>
                    <option value="sobremesa">Sobremesas</option>
                    <option value="entrada">Entradas</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProdutoModal(false)
                      setProdutoForm({ nome: '', descricao: '', preco: '', categoria: '' })
                      setError(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cadastrar Produto
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage

