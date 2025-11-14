const jwt = require("jsonwebtoken");
const User = require("../models/User");
const getUserToken = require("./getUserToken");

const isAuthenticated = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado" });
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
    next(); 

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expirado." });
    }
    
    return res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = isAuthenticated;