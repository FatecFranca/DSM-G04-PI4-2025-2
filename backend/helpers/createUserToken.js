const jwt = require("jsonwebtoken");

const createUserToken = async (user, req, res) => {
  const payload = {
    name: user.nome,
    id: user._id,
    cargo: user.cargo,
    empresa: user.empresa,
  };
  const secret = process.env.JWT_SECRET || "secret";

  const token = jwt.sign(payload, secret, {
    expiresIn: "1d",
  });
  
  res.status(200).json({
    message: "Você está autenticado!",
    token: token,
    user: {
      id: user._id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      empresa: user.empresa
    }
  });
};

module.exports = createUserToken;
