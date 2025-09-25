const jwt = require("jsonwebtoken");
const User = require("../models/User");
const getUserToken = require("../helpers/getUserToken");
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
    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret);

    req.user = await User.findById(decoded.id).select("-senha -pin");

    next();
  } catch (error) {
    res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = isAuthenticated;
