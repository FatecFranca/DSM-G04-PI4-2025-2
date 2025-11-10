/**
 * Serviço de API para integração com backend DrinkFlow
 * Base URL: http://localhost:5000
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class ApiService {
  /**
   * Método auxiliar para fazer requisições
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const token = localStorage.getItem('token')

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error)
      throw error
    }
  }

  // ============ AUTENTICAÇÃO ============

  /**
   * Login do usuário
   * @param {string} email - Email do usuário
   * @param {string} credencial - Senha (gerente) ou PIN (funcionário)
   */
  static async login(email, credencial) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, credencial })
    })

    if (response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    return response
  }

  /**
   * Logout do usuário
   */
  static logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * Obter usuário logado
   */
  static getLoggedUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  // ============ FUNCIONÁRIOS ============

  /**
   * Adicionar novo funcionário (apenas gerente)
   * @param {object} funcionario - {nome, email, cpf, cargo}
   */
  static async addFuncionario(funcionario) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(funcionario)
    })
  }

  /**
   * Obter todos os funcionários da empresa (apenas gerente)
   */
  static async getAllFuncionarios() {
    return this.request('/users', {
      method: 'GET'
    })
  }

  /**
   * Obter um funcionário específico (apenas gerente)
   * @param {string} id - ID do funcionário
   */
  static async getFuncionario(id) {
    return this.request(`/users/${id}`, {
      method: 'GET'
    })
  }

  /**
   * Atualizar um funcionário (apenas gerente)
   * @param {string} id - ID do funcionário
   * @param {object} dados - {nome, email, cargo}
   */
  static async updateFuncionario(id, dados) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Deletar (desativar) um funcionário (apenas gerente)
   * @param {string} id - ID do funcionário
   */
  static async deleteFuncionario(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    })
  }

  // ============ EMPRESAS ============

  /**
   * Criar empresa e usuário gerente
   */
  static async createEmpresa(dados) {
    return this.request('/empresas/register', {
      method: 'POST',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Obter empresa
   */
  static async getEmpresa(id) {
    return this.request(`/empresas/${id}`, {
      method: 'GET'
    })
  }

  /**
   * Atualizar empresa
   */
  static async updateEmpresa(id, dados) {
    return this.request(`/empresas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados)
    })
  }

  // ============ MESAS ============

  /**
   * Criar mesa
   */
  static async createMesa(dados) {
    return this.request('/mesas', {
      method: 'POST',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Obter todas as mesas
   */
  static async getAllMesas() {
    return this.request('/mesas', {
      method: 'GET'
    })
  }

  /**
   * Obter uma mesa específica
   */
  static async getMesa(id) {
    return this.request(`/mesas/${id}`, {
      method: 'GET'
    })
  }

  /**
   * Atualizar mesa
   */
  static async updateMesa(id, dados) {
    return this.request(`/mesas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Deletar mesa
   */
  static async deleteMesa(id) {
    return this.request(`/mesas/${id}`, {
      method: 'DELETE'
    })
  }

  // ============ CHAMADOS ============

  /**
   * Criar chamado
   */
  static async createChamado(dados) {
    return this.request('/chamados', {
      method: 'POST',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Obter todos os chamados
   */
  static async getAllChamados() {
    return this.request('/chamados', {
      method: 'GET'
    })
  }

  /**
   * Obter um chamado específico
   */
  static async getChamado(id) {
    return this.request(`/chamados/${id}`, {
      method: 'GET'
    })
  }

  /**
   * Atualizar chamado
   */
  static async updateChamado(id, dados) {
    return this.request(`/chamados/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Deletar chamado
   */
  static async deleteChamado(id) {
    return this.request(`/chamados/${id}`, {
      method: 'DELETE'
    })
  }

  // ============ CARDÁPIO ============

  /**
   * Criar item do cardápio
   */
  static async createCardapio(dados) {
    return this.request('/cardapios', {
      method: 'POST',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Obter todos os itens do cardápio
   */
  static async getAllCardapios() {
    return this.request('/cardapios', {
      method: 'GET'
    })
  }

  /**
   * Obter um item específico do cardápio
   */
  static async getCardapio(id) {
    return this.request(`/cardapios/${id}`, {
      method: 'GET'
    })
  }

  /**
   * Atualizar item do cardápio
   */
  static async updateCardapio(id, dados) {
    return this.request(`/cardapios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados)
    })
  }

  /**
   * Deletar item do cardápio
   */
  static async deleteCardapio(id) {
    return this.request(`/cardapios/${id}`, {
      method: 'DELETE'
    })
  }

  // ============ RELATÓRIOS ============

  /**
   * Obter KPIs de vendas (faturamento, ticket médio, intervalo de confiança)
   * @param {string} dataInicio - Data inicial (opcional) YYYY-MM-DD
   * @param {string} dataFim - Data final (opcional) YYYY-MM-DD
   */
  static async getKPIs(dataInicio = null, dataFim = null) {
    const params = new URLSearchParams()
    if (dataInicio) params.append('dataInicio', dataInicio)
    if (dataFim) params.append('dataFim', dataFim)
    
    const queryString = params.toString()
    return this.request(`/relatorios/kpis${queryString ? '?' + queryString : ''}`, {
      method: 'GET'
    })
  }

  /**
   * Obter previsão de vendas com regressão linear
   * @param {string} dataInicio - Data inicial (opcional) YYYY-MM-DD
   * @param {string} dataFim - Data final (opcional) YYYY-MM-DD
   */
  static async getPrevisaoVendas(dataInicio = null, dataFim = null) {
    const params = new URLSearchParams()
    if (dataInicio) params.append('dataInicio', dataInicio)
    if (dataFim) params.append('dataFim', dataFim)
    
    const queryString = params.toString()
    return this.request(`/relatorios/previsao-vendas${queryString ? '?' + queryString : ''}`, {
      method: 'GET'
    })
  }

  /**
   * Obter 5 itens mais vendidos
   */
  static async getItensMaisVendidos() {
    return this.request('/relatorios/itens-mais-vendidos', {
      method: 'GET'
    })
  }

  /**
   * Obter estatísticas de vendas (moda, mediana, assimetria)
   * @param {string} dataInicio - Data inicial (opcional) YYYY-MM-DD
   * @param {string} dataFim - Data final (opcional) YYYY-MM-DD
   */
  static async getEstatisticasVendas(dataInicio = null, dataFim = null) {
    const params = new URLSearchParams()
    if (dataInicio) params.append('dataInicio', dataInicio)
    if (dataFim) params.append('dataFim', dataFim)
    
    const queryString = params.toString()
    return this.request(`/relatorios/estatisticas-vendas${queryString ? '?' + queryString : ''}`, {
      method: 'GET'
    })
  }

  /**
   * Obter distribuição de métodos de pagamento
   * @param {string} dataInicio - Data inicial (opcional) YYYY-MM-DD
   * @param {string} dataFim - Data final (opcional) YYYY-MM-DD
   */
  static async getMetodosPagamento(dataInicio = null, dataFim = null) {
    const params = new URLSearchParams()
    if (dataInicio) params.append('dataInicio', dataInicio)
    if (dataFim) params.append('dataFim', dataFim)
    
    const queryString = params.toString()
    return this.request(`/relatorios/metodos-pagamento${queryString ? '?' + queryString : ''}`, {
      method: 'GET'
    })
  }

  // ============ DASHBOARD ============

  /**
   * Obter estatísticas gerais do dashboard
   * @param {string} dataInicio - Data inicial (opcional) YYYY-MM-DD
   * @param {string} dataFim - Data final (opcional) YYYY-MM-DD
   */
  static async getDashboardStats(dataInicio = null, dataFim = null) {
    const params = new URLSearchParams()
    if (dataInicio) params.append('dataInicio', dataInicio)
    if (dataFim) params.append('dataFim', dataFim)
    
    const queryString = params.toString()
    
    // Buscar dados de múltiplos endpoints e consolidar
    const [kpis, itens, estatisticas] = await Promise.all([
      this.getKPIs(dataInicio, dataFim).catch(() => null),
      this.getItensMaisVendidos().catch(() => []),
      this.getEstatisticasVendas(dataInicio, dataFim).catch(() => null)
    ])
    
    return {
      kpis,
      topItems: itens,
      statistics: estatisticas
    }
  }

  /**
   * Obter pedidos recentes
   * @param {number} limit - Número de pedidos a retornar
   */
  static async getRecentOrders(limit = 10) {
    // Assumindo que existe um endpoint de pedidos
    return this.request(`/pedidos?limit=${limit}`, {
      method: 'GET'
    }).catch(() => ({ pedidos: [] }))
  }

  /**
   * Obter itens com baixo estoque
   */
  static async getLowStockItems() {
    // Buscar todos os itens do cardápio e filtrar os que têm estoque baixo
    const response = await this.getAllCardapios().catch(() => ({ itens: [] }))
    const itens = response.itens || response.cardapios || []
    
    // Filtrar itens com estoque baixo (se houver campo de estoque)
    return itens.filter(item => item.estoque && item.estoque < 10)
  }
}

export default ApiService
