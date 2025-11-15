const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

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

    const empresaRoom = `empresa_${socket.empresaId}`;
    socket.join(empresaRoom);

    if (!empresaRooms.has(socket.empresaId)) {
      empresaRooms.set(socket.empresaId, new Set());
    }
    empresaRooms.get(socket.empresaId).add(socket.id);


    socket.emit("connected", {
      message: "Conectado ao WebSocket",
      empresaId: socket.empresaId,
      cargo: socket.userCargo,
    });

    socket.on("disconnect", () => {

      if (empresaRooms.has(socket.empresaId)) {
        empresaRooms.get(socket.empresaId).delete(socket.id);
        if (empresaRooms.get(socket.empresaId).size === 0) {
          empresaRooms.delete(socket.empresaId);
        }
      }
    });

    socket.on("error", (error) => {
      console.error(`⚠️ Erro no socket ${socket.id}:`, error);
    });
  });

  return io;
}


function emitToEmpresa(empresaId, event, data) {
  if (!io) return;
  const room = `empresa_${empresaId}`;
  io.to(room).emit(event, data);
}

function emitNovoPedido(empresaId, pedido) {
  emitToEmpresa(empresaId, "novo_pedido", pedido);
}

function emitAtualizacaoPedido(empresaId, pedido) {
  emitToEmpresa(empresaId, "pedido_atualizado", pedido);
}

function emitNovoChamado(empresaId, chamado) {
  emitToEmpresa(empresaId, "novo_chamado", chamado);
}

function emitAtualizacaoChamado(empresaId, chamado) {
  emitToEmpresa(empresaId, "chamado_atualizado", chamado);
}

function emitAtualizacaoMesa(empresaId, mesa) {
  emitToEmpresa(empresaId, "mesa_atualizada", mesa);
}

function emitNovaConta(empresaId, conta) {
  emitToEmpresa(empresaId, "nova_conta", conta);
}

function emitAtualizacaoConta(empresaId, conta) {
  emitToEmpresa(empresaId, "conta_atualizada", conta);
}

function emitNovoPagamento(empresaId, pagamento) {
  emitToEmpresa(empresaId, "novo_pagamento", pagamento);
}

function getConnectedClients(empresaId) {
  if (!empresaRooms.has(empresaId)) return 0;
  return empresaRooms.get(empresaId).size;
}

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
