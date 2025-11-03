const express = require("express");
const app = express();
const cors = require("cors");

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

app.use('/users', userRoutes)
app.use('/empresas', empresaRoutes)
app.use('/mesas', mesaRoutes)
app.use('/chamados', chamadosRoutes)

app.listen(5000, () => {
  console.log('🚀 Servidor rodando na porta 5000')
  console.log('📡 API disponível em: http://localhost:5000')
})