import axios from "axios";

const API_BASE_URL = "http://172.191.224.11:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    console.log('❌ Erro na requisição:', error.response?.status, error.config?.url);

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Token expirado (401), tentando refresh...');
      originalRequest._retry = true; 

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error('❌ Refresh token não encontrado no localStorage');
          throw new Error("Refresh token não encontrado");
        }
        
        console.log('🔄 Chamando /auth/refresh com token:', refreshToken.substring(0, 20) + '...');
        const rs = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          token: refreshToken,
        });

        const { accessToken } = rs.data;
        console.log('✅ Novo accessToken recebido:', accessToken ? accessToken.substring(0, 20) + '...' : 'ERRO');
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        console.log('🔄 Refazendo requisição original:', originalRequest.url);
        return api(originalRequest);
      } catch (_error) {
        console.error('❌ Erro no refresh, fazendo logout:', _error.response?.data || _error.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(_error);
      }
    }

    // Se o erro não for 401, só repassa o erro
    return Promise.reject(error);
  }
);

class ApiService {
  // ============ AUTENTICAÇÃO ============

  /**
   * Login do usuário
   * @param {string} email - Email do usuário
   * @param {string} credencial - Senha (gerente) ou PIN (funcionário)
   */
  static async login(email, credencial) {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email,
      credencial,
    });
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken); // ⬅️ Novo nome
      localStorage.setItem("refreshToken", response.data.refreshToken); // ⬅️ Novo token
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  }
  static async logout() {

    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { token: refreshToken });
      } catch (error) {
        console.error("Erro ao fazer logout no backend:", error);
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  static getLoggedUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  // ============ FUNCIONÁRIOS ============

  /**
   * Adicionar novo funcionário (apenas gerente)
   * @param {object} funcionario - {nome, email, cpf, cargo}
   */
  static async addFuncionario(funcionario) {
    const response = await api.post("/users/register", funcionario);
    return response.data;
  }
  static async getAllFuncionarios() {
    const response = await api.get("/users");
    return response.data;
  }
  static async getFuncionario(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
  static async updateFuncionario(id, dados) {
    const response = await api.patch(`/users/${id}`, dados);
    return response.data;
  }
  static async deleteFuncionario(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  // Aliases para compatibilidade
  static async createUser(dados) {
    return this.addFuncionario(dados);
  }
  static async updateUser(id, dados) {
    return this.updateFuncionario(id, dados);
  }
  static async deleteUser(id) {
    return this.deleteFuncionario(id);
  }

  // --- EMPRESAS ---
  static async createEmpresa(dados) {
    const response = await api.post("/empresas/register", dados);
    return response.data;
  }
  static async getEmpresa() {
    const response = await api.get(`/empresas/me`);
    return response.data;
  }
  static async updateEmpresa(dados) {
    const response = await api.patch(`/empresas/me`, dados);
    return response.data;
  }

  // --- MESAS ---
  static async createMesa(dados) {
    const response = await api.post("/mesas", dados);
    return response.data;
  }
  static async getAllMesas() {
    const response = await api.get("/mesas");
    return response.data;
  }
  static async getMesa(id) {
    const response = await api.get(`/mesas/${id}`);
    return response.data;
  }
  static async updateMesa(id, dados) {
    const response = await api.patch(`/mesas/${id}`, dados);
    return response.data;
  }
  static async deleteMesa(id) {
    const response = await api.delete(`/mesas/${id}`);
    return response.data;
  }

  // --- CHAMADOS ---
  static async createChamado(dados) {
    const response = await api.post("/chamados", dados);
    return response.data;
  }
  static async getAllChamados() {
    const response = await api.get("/chamados/pendentes");
    return response.data;
  }
  static async getChamado(id) {
    const response = await api.get(`/chamados/${id}`);
    return response.data;
  }
  static async updateChamado(id, dados) {
    const response = await api.patch(`/chamados/${id}`, dados);
    return response.data;
  }
  static async deleteChamado(id) {
    const response = await api.delete(`/chamados/${id}`);
    return response.data;
  }

  // --- CARDÁPIO ---
  static async createCardapio(dados) {
    const response = await api.post("/cardapios", dados);
    return response.data;
  }
  static async getAllCardapios() {
    const response = await api.get("/cardapios");
    return response.data;
  }
  static async getCardapio(id) {
    const response = await api.get(`/cardapios/${id}`);
    return response.data;
  }
  static async updateCardapio(id, dados) {
    const response = await api.patch(`/cardapios/${id}`, dados);
    return response.data;
  }
  static async deleteCardapio(id) {
    const response = await api.delete(`/cardapios/${id}`);
    return response.data;
  }
  // ============ RELATÓRIOS ============

  static async getKPIs(dataInicio = null, dataFim = null) {
    const response = await api.get('/relatorios/kpis', { 
      params: { dataInicio, dataFim } 
    });
    return response.data;
  }

  static async getPrevisaoVendas(dataInicio = null, dataFim = null) {
    const response = await api.get('/relatorios/previsao-vendas', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  }

  static async getItensMaisVendidos() {
    const response = await api.get('/relatorios/itens-mais-vendidos');
    return response.data;
  }

  static async getEstatisticasVendas(dataInicio = null, dataFim = null) {
    const response = await api.get('/relatorios/estatisticas-vendas', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  }

  static async getMetodosPagamento(dataInicio = null, dataFim = null) {
    const response = await api.get('/relatorios/metodos-pagamento', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  }

  // ============ DASHBOARD (MUDOU!) ============
  
  static async getDashboardStats(dataInicio = null, dataFim = null) {
    const [kpis, itens, estatisticas] = await Promise.all([
      this.getKPIs(dataInicio, dataFim),
      this.getItensMaisVendidos(),
      this.getEstatisticasVendas(dataInicio, dataFim)
    ]);
    
    return {
      kpis,
      topItems: itens,
      statistics: estatisticas
    };
  }

  static async getRecentOrders(limit = 10) {
    const response = await api.get('/pedidos', { params: { limit } });
    return response.data;
  }

  static async getLowStockItems() {
    const response = await this.getAllCardapios();
    const itens = response.itens || response.cardapios || [];
    return itens.filter(item => item.estoque && item.estoque < 10);
  }
}

export default ApiService;