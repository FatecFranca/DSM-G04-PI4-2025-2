import { create } from 'zustand';
import { websocketService } from '../services/websocket';
import { pedidoAPI } from '../services/api';

interface PedidoPronto {
  _id: string;
  mesa: {
    _id: string;
    numero: number;
  };
  status: string;
}

interface PedidoProntoState {
  pedidosProntos: PedidoPronto[];
  setPedidosProntos: (pedidos: PedidoPronto[]) => void;
  addPedidoPronto: (pedido: PedidoPronto) => void;
  removePedidoPronto: (pedidoId: string) => void;
  initializeListeners: () => void;
  carregarPedidosProntos: () => Promise<void>;
}

export const usePedidoProntoStore = create<PedidoProntoState>((set, get) => ({
  pedidosProntos: [],

  setPedidosProntos: (pedidos) => set({ pedidosProntos: pedidos }),

  addPedidoPronto: (pedido) =>
    set((state) => {
      const existe = state.pedidosProntos.find((p) => p._id === pedido._id);
      if (existe) return state;
      return { pedidosProntos: [...state.pedidosProntos, pedido] };
    }),

  removePedidoPronto: (pedidoId) =>
    set((state) => ({
      pedidosProntos: state.pedidosProntos.filter((p) => p._id !== pedidoId),
    })),

  carregarPedidosProntos: async () => {
    try {
      const response = await pedidoAPI.listarProntos();
      set({ pedidosProntos: response.pedidos || [] });
    } catch (error) {
      console.error('Erro ao carregar pedidos prontos:', error);
    }
  },

  initializeListeners: () => {
    websocketService.on('pedido_atualizado', (pedidoAtualizado: any) => {
      if (pedidoAtualizado.status === 'pronto') {
        get().addPedidoPronto(pedidoAtualizado);
      } else if (pedidoAtualizado.status === 'entregue') {
        get().removePedidoPronto(pedidoAtualizado._id);
      }
    });
  },
}));
