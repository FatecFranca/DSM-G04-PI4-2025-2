import axios from "axios";
import { API_CONFIG } from "../config/api.config";
import { useUserStore } from "../stores/userStore";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    itens: {
      item: string;
      quantidade: number;
      preco_unitario: number;
      observacao?: string;
    }[];
    status: string;
    observacoes_gerais?: string;
  };
}

// Endpoints
export const cardapioAPI = {
  // Listar itens do cardápio
  listar: async (): Promise<CardapioItem[]> => {
    const response = await api.get("/cardapio");
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
  criar: async (
    mesaId: string,
    pedido: CriarPedidoRequest
  ): Promise<CriarPedidoResponse> => {
    const response = await api.post(`/pedidos/mesa/${mesaId}`, pedido);
    return response.data;
  },

  // Listar pedidos prontos (garçom)
  listarProntos: async () => {
    const response = await api.get("/pedidos/garcom/prontos");
    return response.data;
  },

  // Marcar pedido como entregue
  marcarEntregue: async (pedidoId: string) => {
    const response = await api.patch(`/pedidos/${pedidoId}/entregue`);
    return response.data;
  },
};

export interface Mesa {
  _id: string;
  numero: number;
  status:
    | "livre"
    | "ocupada"
    | "aguardando_atendimento"
    | "aguardando_pagamento";
  conta_ativa: string | null;
  empresa: string;
}

export const mesaAPI = {
  // Listar mesas
  listar: async (): Promise<Mesa[]> => {
    try {
      const response = await api.get("/mesas");

      // Verifica se a resposta tem o formato esperado { mesas: Mesa[] }
      if (!response.data || !response.data.mesas) {
        throw new Error("Formato de resposta inválido");
      }

      // Retorna o array de mesas
      return response.data.mesas;
    } catch (error) {
      console.error("Erro na requisição da API:", error);
      throw error;
    }
  },

  // Buscar mesa por ID
  buscarPorId: async (id: string): Promise<Mesa> => {
    const response = await api.get(`/mesas/${id}`);
    return response.data;
  },
};

export interface Chamado {
  _id: string;
  mesa: string | { _id: string; numero: number }; // Pode ser o ID ou o objeto da mesa quando populado
  status: "pendente" | "atendido" | "resolvido";
  createdAt: string;
  updatedAt: string;
}

export const chamadoAPI = {
  // Listar chamados
  listar: async (): Promise<Chamado[]> => {
    const response = await api.get("/chamados/pendentes");
    return response.data.chamados || [];
  },

  // Atender chamado
  atender: async (chamadoId: string): Promise<Chamado> => {
    const response = await api.patch(`/chamados/${chamadoId}/aceitar`);
    return response.data.chamado;
  },
};

export interface Pedido {
  _id: string;
  itens: {
    item: {
      _id: string;
      nome: string;
      preco: number;
    };
    quantidade: number;
    preco_unitario: number;
    observacao?: string;
  }[];
  status: string;
  garcom?: {
    _id: string;
    nome: string;
  };
  observacoes_gerais?: string;
}

export interface Conta {
  _id: string;
  mesa: string;
  status: "aberta" | "fechada" | "cancelada";
  valor_total: number;
  valor_pago: number;
  pedidos: Pedido[];
  created_at: string;
  updated_at: string;
}

export const contaAPI = {
  // Abrir conta para uma mesa
  abrir: async (mesaId: string): Promise<{ message: string; conta: Conta }> => {
    try {
      const response = await api.post("/contas", { mesaId });
      return response.data;
    } catch (error) {
      console.error("Erro ao abrir conta:", error);
      throw error;
    }
  },

  // Obter conta ativa de uma mesa
  getContaAtiva: async (mesaId: string): Promise<Conta | null> => {
    try {
      const response = await api.get(`/contas/mesa/${mesaId}/ativa`);
      return response.data.conta || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Cancelar conta (apenas gerente)
  cancelar: async (contaId: string): Promise<{ message: string }> => {
    const response = await api.patch(`/contas/${contaId}/cancelar`);
    return response.data;
  },
};

export const userAPI = {
  // Faz login do usuário (email + credencial: senha ou PIN)
  login: async (email: string, credencial: string) => {
    const response = await api.post("/users/login", { email, credencial });
    return response.data;
  },
};

export default api;
