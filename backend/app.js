require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const { initializeWebSocket } = require("./websocket");

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

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

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Click Serve API',
      version: '1.0.0',
      description: 'API para o sistema de gerenciamento de restaurante Click Serve',
    },
    servers: [
      {
        url: 'http://172.191.224.11:5000', // URL DA SUA VM
        description: 'Servidor de Produção (Azure VM)',
      },
      {
        url: 'http://localhost:5000',
        description: 'Servidor de Desenvolvimento Local',
      }
    ],
    // Define como a segurança (JWT) funciona
    components: {
      securitySchemes: {
        bearerAuth: { // (Nome da nossa regra de segurança)
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT (AccessToken) obtido no login',
        },
      },
    },
    // Força o "cadeado" em todas as rotas
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Onde o swagger-jsdoc vai "ler" os comentários
  apis: ['./routes/*.js', './models/*.js'], 
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
  console.log("API REST disponível em: http://localhost:5000");
  console.log("WebSocket disponível em: ws://localhost:5000");
});
