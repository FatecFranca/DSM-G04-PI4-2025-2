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

app.use('/users', userRoutes)
app.use('/empresas', empresaRoutes)

app.listen(5000)