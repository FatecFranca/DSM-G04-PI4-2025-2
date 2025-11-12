const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

// Mapa para armazenar conexões por empresa
const empresaRooms = new Map();

function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8081",
      ],
      credentials: true,
    },
  });

  // Middleware de autenticação
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token não fornecido"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userCargo = decoded.cargo;
      socket.empresaId = decoded.empresa;
      next();
    } catch (err) {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ Cliente conectado: ${socket.id} (Empresa: ${socket.empresaId}, Cargo: ${socket.userCargo})`
    );

    // Entrar na sala da empresa
    const empresaRoom = `empresa_${socket.empresaId}`;
    socket.join(empresaRoom);

    // Rastrear conexões por empresa
    if (!empresaRooms.has(socket.empresaId)) {
      empresaRooms.set(socket.empresaId, new Set());
    }
    empresaRooms.get(socket.empresaId).add(socket.id);

    console.log(`📍 Cliente ${socket.id} entrou na sala: ${empresaRoom}`);

    // Enviar confirmação de conexão
    socket.emit("connected", {
      message: "Conectado ao WebSocket",
      empresaId: socket.empresaId,
      cargo: socket.userCargo,
    });

    // Desconexão
    socket.on("disconnect", () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);

      // Remover da lista de conexões da empresa
      if (empresaRooms.has(socket.empresaId)) {
        empresaRooms.get(socket.empresaId).delete(socket.id);
        if (empresaRooms.get(socket.empresaId).size === 0) {
          empresaRooms.delete(socket.empresaId);
        }
      }
    });

    // Evento de erro
    socket.on("error", (error) => {
      console.error(`⚠️ Erro no socket ${socket.id}:`, error);
    });
  });

  return io;
}

// Funções auxiliares para emitir eventos

// Emitir para toda a empresa
function emitToEmpresa(empresaId, event, data) {
  if (!io) return;
  const room = `empresa_${empresaId}`;
  io.to(room).emit(event, data);
  console.log(`📤 Evento "${event}" enviado para empresa ${empresaId}:`, data);
}

// Emitir novo pedido
function emitNovoPedido(empresaId, pedido) {
  emitToEmpresa(empresaId, "novo_pedido", pedido);
}

// Emitir atualização de pedido
function emitAtualizacaoPedido(empresaId, pedido) {
  emitToEmpresa(empresaId, "pedido_atualizado", pedido);
}

// Emitir novo chamado
function emitNovoChamado(empresaId, chamado) {
  emitToEmpresa(empresaId, "novo_chamado", chamado);
}

// Emitir atualização de chamado
function emitAtualizacaoChamado(empresaId, chamado) {
  emitToEmpresa(empresaId, "chamado_atualizado", chamado);
}

// Emitir atualização de mesa
function emitAtualizacaoMesa(empresaId, mesa) {
  emitToEmpresa(empresaId, "mesa_atualizada", mesa);
}

// Emitir nova conta
function emitNovaConta(empresaId, conta) {
  emitToEmpresa(empresaId, "nova_conta", conta);
}

// Emitir atualização de conta
function emitAtualizacaoConta(empresaId, conta) {
  emitToEmpresa(empresaId, "conta_atualizada", conta);
}

// Emitir novo pagamento
function emitNovoPagamento(empresaId, pagamento) {
  emitToEmpresa(empresaId, "novo_pagamento", pagamento);
}

// Obter número de clientes conectados por empresa
function getConnectedClients(empresaId) {
  if (!empresaRooms.has(empresaId)) return 0;
  return empresaRooms.get(empresaId).size;
}

// Obter instância do io
function getIO() {
  if (!io) {
    throw new Error("Socket.io não foi inicializado");
  }
  return io;
}

module.exports = {
  initializeWebSocket,
  emitToEmpresa,
  emitNovoPedido,
  emitAtualizacaoPedido,
  emitNovoChamado,
  emitAtualizacaoChamado,
  emitAtualizacaoMesa,
  emitNovaConta,
  emitAtualizacaoConta,
  emitNovoPagamento,
  getConnectedClients,
  getIO,
};
