import axios from "axios";
import { API_CONFIG } from "../config/api.config";
import { useUserStore } from "../stores/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useUserStore.getState().refreshToken;

      if (!refreshToken) {
        await useUserStore.getState().logout();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { token: refreshToken }
        );

        const { accessToken } = response.data;

        await AsyncStorage.setItem("@auth_token", accessToken);
        useUserStore.getState().setToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {

        processQueue(refreshError, null);
        await useUserStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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

export const cardapioAPI = {
  listar: async (): Promise<CardapioItem[]> => {
    const response = await api.get("/cardapios");
    return response.data;
  },

  buscarPorId: async (id: string): Promise<CardapioItem> => {
    const response = await api.get(`/cardapios/${id}`);
    return response.data;
  },
};

export interface PedidoCozinha {
  _id: string;
  mesa: {
    _id: string;
    numero: number;
  };
  itens: {
    item: {
      _id: string;
      nome: string;
    };
    quantidade: number;
    preco_unitario: number;
    observacao?: string;
  }[];
  status: 'enviado_cozinha' | 'preparando' | 'pronto' | 'entregue';
  observacoes_gerais?: string;
  createdAt: string;
  cozinheiro?: {
    _id: string;
    nome: string;
  };
}

export const pedidoAPI = {
  criar: async (
    mesaId: string,
    pedido: CriarPedidoRequest
  ): Promise<CriarPedidoResponse> => {
    const response = await api.post(`/pedidos/mesa/${mesaId}`, pedido);
    return response.data;
  },

  listarProntos: async () => {
    const response = await api.get("/pedidos/garcom/prontos");
    return response.data;
  },

  marcarEntregue: async (pedidoId: string) => {
    const response = await api.patch(`/pedidos/${pedidoId}/entregue`);
    return response.data;
  },

  listarCozinha: async (): Promise<PedidoCozinha[]> => {
    const response = await api.get("/pedidos/cozinha");
    return response.data.pedidos || [];
  },

  iniciarPreparo: async (pedidoId: string) => {
    const response = await api.patch(`/pedidos/${pedidoId}/preparar`);
    return response.data;
  },

  marcarPronto: async (pedidoId: string) => {
    const response = await api.patch(`/pedidos/${pedidoId}/pronto`);
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
  listar: async (): Promise<Mesa[]> => {
    try {
      const response = await api.get("/mesas");

      if (!response.data || !response.data.mesas) {
        throw new Error("Formato de resposta inválido");
      }

      return response.data.mesas;
    } catch (error) {
      console.error("Erro na requisição da API:", error);
      throw error;
    }
  },

  buscarPorId: async (id: string): Promise<Mesa> => {
    const response = await api.get(`/mesas/${id}`);
    return response.data;
  },
};

export interface Chamado {
  _id: string;
  mesa: string | { _id: string; numero: number };
  status: "pendente" | "atendido" | "resolvido";
  createdAt: string;
  updatedAt: string;
}

export const chamadoAPI = {
  listar: async (): Promise<Chamado[]> => {
    const response = await api.get("/chamados/pendentes");
    return response.data.chamados || [];
  },

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
  abrir: async (mesaId: string): Promise<{ message: string; conta: Conta }> => {
    try {
      const response = await api.post("/contas", { mesaId });
      return response.data;
    } catch (error) {
      console.error("Erro ao abrir conta:", error);
      throw error;
    }
  },

  getContaAtiva: async (mesaId: string): Promise<Conta | null> => {
    try {
      const response = await api.get(`/contas/mesa/${mesaId}/ativa`);
      return response.data.conta || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  cancelar: async (contaId: string): Promise<{ message: string }> => {
    const response = await api.patch(`/contas/${contaId}/cancelar`);
    return response.data;
  },
};

export const userAPI = {
  login: async (email: string, credencial: string) => {
    const response = await api.post("/users/login", { email, credencial });
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      token: refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post("/auth/logout", { token: refreshToken });
    return response.data;
  },
};

export const pagamentoAPI = {
  adicionar: async (contaId: string, valor: number, metodo: string) => {
    const response = await api.post('/pagamentos', {
      contaId,
      valor,
      metodo,
    });
    return response.data;
  },

  listarPorConta: async (contaId: string) => {
    const response = await api.get(`/pagamentos/conta/${contaId}`);
    return response.data;
  },
};

export interface DesempenhoVendas {
  faturamentoTotal: number;
  totalPedidos: number;
  ticketMedio: number;
}

export interface DesempenhoAtendimento {
  tempoMedioSegundos: number;
  totalChamados: number;
  nomeGarcom: string;
}

export const relatorioAPI = {
  meuDesempenhoVendas: async (dataInicio?: string, dataFim?: string): Promise<DesempenhoVendas> => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    
    const response = await api.get(`/relatorios/meu-desempenho-vendas?${params.toString()}`);
    return response.data;
  },

  meuDesempenhoAtendimento: async (dataInicio?: string, dataFim?: string): Promise<DesempenhoAtendimento> => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    
    const response = await api.get(`/relatorios/meu-desempenho-atendimento?${params.toString()}`);
    return response.data;
  },
};

export default api;
