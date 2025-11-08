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
}

export default ApiService
