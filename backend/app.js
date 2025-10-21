const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
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

app.listen(5000)