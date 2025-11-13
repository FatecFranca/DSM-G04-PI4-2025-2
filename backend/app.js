require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const { initializeWebSocket } = require("./websocket");

require("./db/conn");

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8081",
    ],
  })
);

const userRoutes = require("./routes/userRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const mesaRoutes = require("./routes/mesaRoutes");
const chamadosRoutes = require("./routes/chamadosRoutes");
const cardapiosRoutes = require("./routes/cardapiosRoutes");
const pedidosRoutes = require("./routes/pedidosRoutes");
const contaRoutes = require("./routes/contaRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");
const relatorioRoutes = require("./routes/relatorioRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/empresas", empresaRoutes);
app.use("/mesas", mesaRoutes);
app.use("/chamados", chamadosRoutes);
app.use("/cardapios", cardapiosRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/contas", contaRoutes);
app.use("/pagamentos", pagamentoRoutes);
app.use("/relatorios", relatorioRoutes);

// Criar servidor HTTP
const server = http.createServer(app);

// Inicializar WebSocket
initializeWebSocket(server);

server.listen(5000, () => {
  console.log("🚀 Servidor rodando na porta 5000");
  
});
