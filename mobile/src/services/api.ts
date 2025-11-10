import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    // TODO: Adicionar token de autenticação quando implementar login
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tipos
export interface CardapioItem {
  _id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
}

export interface PedidoItem {
  item: string;
  quantidade: number;
  observacao?: string;
}

export interface CriarPedidoRequest {
  itens: PedidoItem[];
  observacoes_gerais?: string;
}

export interface CriarPedidoResponse {
  message: string;
  pedido: {
    _id: string;
    itens: Array<{
      item: string;
      quantidade: number;
      preco_unitario: number;
      observacao?: string;
    }>;
    status: string;
    observacoes_gerais?: string;
  };
}

// Endpoints
export const cardapioAPI = {
  // Listar itens do cardápio
  listar: async (): Promise<CardapioItem[]> => {
    const response = await api.get('/cardapio');
    return response.data;
  },

  // Buscar item por ID
  buscarPorId: async (id: string): Promise<CardapioItem> => {
    const response = await api.get(`/cardapio/${id}`);
    return response.data;
  },
};

export const pedidoAPI = {
  // Criar pedido para uma mesa
  criar: async (mesaId: string, pedido: CriarPedidoRequest): Promise<CriarPedidoResponse> => {
    const response = await api.post(`/pedidos/mesa/${mesaId}`, pedido);
    return response.data;
  },

  // Listar pedidos prontos (garçom)
  listarProntos: async () => {
    const response = await api.get('/pedidos/garcom/prontos');
    return response.data;
  },

  // Marcar pedido como entregue
  marcarEntregue: async (pedidoId: string) => {
    const response = await api.patch(`/pedidos/${pedidoId}/entregue`);
    return response.data;
  },
};

export const mesaAPI = {
  // Listar mesas
  listar: async () => {
    const response = await api.get('/mesas');
    return response.data;
  },

  // Buscar mesa por ID
  buscarPorId: async (id: string) => {
    const response = await api.get(`/mesas/${id}`);
    return response.data;
  },
};

export default api;
