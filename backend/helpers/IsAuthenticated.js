// helpers/isAuthenticated.js (CORRIGIDO)
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const getUserToken = require("./getUserToken");

const isAuthenticated = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(422).json({ message: "Acesso negado" });
  }
  const token = getUserToken(req);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado." });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET não definido no servidor.");
    }
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).select("-senha -pin");
    next(); // Token válido, pode passar

  } catch (error) {
    
    // ⬇️ A MUDANÇA ESTÁ AQUI ⬇️
    // Checa o *tipo* do erro
    if (error.name === 'TokenExpiredError') {
        // Se o token SÓ expirou, mandamos 401
        // para o frontend (interceptor) saber que deve tentar o "refresh"
        return res.status(401).json({ message: "Token expirado." });
    }
    
    // Se for qualquer outro erro (assinatura errada, token malformado),
    // é um token inválido e mandamos 400
    return res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = isAuthenticated;