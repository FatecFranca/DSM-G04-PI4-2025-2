// controllers/AuthController.js
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");

module.exports = class AuthController {
  static async refreshToken(req, res) {
    const { token } = req.body;

    if (!token) {
      return res.status(422).json({ message: "Refresh token é obrigatório." });
    }

    const secret = process.env.JWT_SECRET;

    try {
      const tokenDoc = await RefreshToken.findOne({ token: token });
      if (!tokenDoc) {
        return res.status(403).json({ message: "Refresh token inválido." });
      }

      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const accessToken = jwt.sign(
        { id: user._id, cargo: user.cargo, empresa: user.empresa },
        secret,
        { expiresIn: "15m" }
      );

      res.status(200).json({ accessToken });
    } catch (err) {
      // Se o jwt.verify falhar (token expirado, assinatura errada)
      return res
        .status(403)
        .json({ message: "Refresh token inválido ou expirado." });
    }
  }
  static async logout(req, res) {
    const { token } = req.body;
    if (!token) {
      return res.status(422).json({ message: "Refresh token é obrigatório." });
    }

    try {
      await RefreshToken.deleteOne({ token: token });
      res.status(200).json({ message: "Logout bem-sucedido." });
    } catch (err) {
      res.status(500).json({ message: "Erro ao fazer logout." });
    }
  }
};
