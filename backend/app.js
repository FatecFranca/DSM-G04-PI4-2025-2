const express = require("express");
const app = express();
const cors = require("cors");

// Conectar ao banco de dados
require('./db/conn')

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:5173"], // CRA e Vite
  })
);

const userRoutes = require('./routes/userRoutes')
const empresaRoutes = require('./routes/empresaRoutes')
const mesaRoutes = require('./routes/mesaRoutes')
const chamadosRoutes = require('./routes/chamadosRoutes')
const cardapiosRoutes = require('./routes/cardapiosRoutes')
const pedidosRoutes = require('./routes/pedidosRoutes')
const contaRoutes = require('./routes/contaRoutes')
const pagamentoRoutes = require('./routes/pagamentoRoutes')

app.use('/users', userRoutes)
app.use('/empresas', empresaRoutes)
app.use('/mesas', mesaRoutes)
app.use('/chamados', chamadosRoutes)
app.use('/cardapios', cardapiosRoutes)
app.use('/pedidos', pedidosRoutes)
app.use('/contas', contaRoutes)
app.use('/pagamentos', pagamentoRoutes)

app.listen(5000, () => {
  console.log('🚀 Servidor rodando na porta 5000')
  console.log('📡 API disponível em: http://localhost:5000')
})