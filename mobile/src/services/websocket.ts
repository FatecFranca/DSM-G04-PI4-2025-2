import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "../config/api.config";

let socket: Socket | null = null;
let pendingListeners: { event: string; callback: (data: any) => void }[] = [];

export interface WebSocketService {
  connect: (token: string) => void;
  disconnect: () => void;
  isConnected: () => boolean;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export const websocketService: WebSocketService = {
  connect: (token: string) => {
    if (socket?.connected) {
      return;
    }

    socket = io(API_CONFIG.BASE_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      // Registrar listeners pendentes
      if (pendingListeners.length > 0) {
        pendingListeners.forEach(({ event, callback }) => {
          socket?.on(event, callback);
        });
      }
    });

    socket.on("connected", (data) => {
      // Silencioso - conexão estabelecida
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket desconectado:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Erro de conexão WebSocket:", error.message);
      
      // Se for erro de autenticação, não tenta reconectar
      if (error.message.includes('Token inválido') || error.message.includes('jwt')) {
        socket?.disconnect();
      }
    });

    socket.on("error", (error) => {
      console.error("⚠️ Erro WebSocket:", error);
    });
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      pendingListeners = [];
    }
  },

  isConnected: () => {
    return socket?.connected ?? false;
  },

  on: (event: string, callback: (data: any) => void) => {
    if (!socket || !socket.connected) {
      pendingListeners.push({ event, callback });
      return;
    }

    socket.on(event, callback);
  },

  off: (event: string, callback?: (data: any) => void) => {
    if (!socket) return;
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  },
};

export default websocketService;
