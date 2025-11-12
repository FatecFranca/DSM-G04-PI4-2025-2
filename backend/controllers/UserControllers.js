const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const User = require("../models/User");
const bcrypt = require("bcrypt");
const validation = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
module.exports = class UserController {
  static async addFuncionario(req, res) {
    const { nome, email, cpf, cargo } = req.body;
    const empresaId = req.user.empresa;
    const cpfLimpo = cpf.replace(/\D/g, "");
    const emailRegex = validation.email;
    if (!nome || !email || !cpf || !cargo) {
      res.status(422).json({ message: "Todos os campos sao obrigatorios" });
      return;
    }
    if (cpfLimpo.length !== 11) {
      res.status(422).json({ message: "Insira um cpf válido" });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(422).json({ message: "Insira um e-mail válido" });
      return;
    }
    try {
      const funcionarioExist = await User.findOne({ cpf: cpfLimpo });
      if (funcionarioExist) {
        return res.status(409).json({ message: "Funcionário já cadastrado" });
      }
      const pin = cpfLimpo.slice(0, 4);
      const user = new User({
        nome,
        email,
        cpf: cpfLimpo,
        cargo,
        pin,
        empresa: empresaId,
      });
      await user.save();
      return res
        .status(200)
        .json({ message: `Funcionário ${cargo} criado com sucesso` });
    } catch (err) {
      console.error("Erro ao criar funcionário:", err);
      if (err.code === 11000) {
        return res.status(409).json({
          message: "Um funcionário com este e-mail já está cadastrado.",
        });
      }
      return res
        .status(500)
        .json({ message: "Ocorreu um erro no servidor.", error: err.message });
    }
  }
  static async login(req, res) {
    const { email, credencial } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    if (!user.ativo) {
      return res.status(403).json({ message: "Este usuário está inativo." });
    }
    if (user.cargo === "gerente") {
      if (!user.senha || !credencial) {
        return res.status(422).json({ message: "Senha é obrigatória." });
      }
      const passwordMatch = await bcrypt.compare(credencial, user.senha);
      if (!passwordMatch) {
        return res.status(422).json({ message: "Senha inválida." });
      }
    } else {
      if (!user.pin || !credencial) {
        return res.status(422).json({ message: "PIN é obrigatório." });
      }
      const pinMatch = await bcrypt.compare(credencial, user.pin);
      if (!pinMatch) {
        return res.status(422).json({ message: "PIN inválido." });
      }
    }
    try {
      const secret = process.env.JWT_SECRET;
      const accessToken = jwt.sign(
        { id: user._id, cargo: user.cargo, empresa: user.empresa },
        secret,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: user._id, cargo: user.cargo, empresa: user.empresa },
        secret,
        { expiresIn: "7d" }
      );
      await RefreshToken.findOneAndDelete({ user: user._id });

      await RefreshToken.create({
        user: user._id,
        token: refreshToken,
      });

      res.status(200).json({
        message: "Login bem-sucedido!",
        accessToken,
        refreshToken, 
        user: {
          id: user._id,
          nome: user.nome,
          cargo: user.cargo,
          empresa: user.empresa,
        },
      });
    } catch (err) {
      console.error("Erro ao gerar tokens:", err);
      return res
        .status(500)
        .json({ message: "Erro ao finalizar login.", error: err.message });
    }
  }
  static async getAllFuncionarios(req, res) {
    const empresaId = req.user.empresa;

    try {
      const funcionarios = await User.find({
        empresa: empresaId,
        ativo: true,
      }).select("-senha -pin");
      res.status(200).json({ funcionarios });
    } catch (err) {
      res.status(500).json({
        message: "Erro ao buscar funcionários.",
        error: err.message,
      });
    }
  }
  static async getFuncionario(req, res) {
    const id = req.params.id;
    const empresaId = req.user.empresa;

    try {
      const funcionario = await User.findOne({
        _id: id,
        empresa: empresaId,
        ativo: true,
      });
      if (!funcionario) {
        return res
          .status(404)
          .json({ message: "Funcionário não encontrado nesta empresa" });
      }
      return res.status(200).json({ funcionario: funcionario });
    } catch (err) {
      res.status(500).json({
        message: "Erro ao buscar funcionário.",
        error: err.message,
      });
    }
  }
  static async updateFuncionario(req, res) {
    const id = req.params.id;
    const empresaId = req.user.empresa;

    const updateData = {};
    const camposPermitidos = ["nome", "email", "cargo"];

    for (const campo of camposPermitidos) {
      if (req.body[campo]) {
        updateData[campo] = req.body[campo];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(422)
        .json({ message: "Nenhum dado para atualização foi fornecido." });
    }

    try {
      const funcionarioAtualizado = await User.findOneAndUpdate(
        { _id: id, empresa: empresaId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-senha -pin_acesso");

      if (!funcionarioAtualizado) {
        return res
          .status(404)
          .json({ message: "Funcionário não encontrado nesta empresa." });
      }

      res.status(200).json({
        message: "Funcionário atualizado com sucesso!",
        funcionario: funcionarioAtualizado,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "O e-mail informado já está em uso por outro funcionário.",
        });
      }
      res.status(500).json({
        message: "Erro ao atualizar funcionário.",
        error: error.message,
      });
    }
  }
  static async deleteFuncionario(req, res) {
    const id = req.params.id;
    const empresaId = req.user.empresa;
    const gerenteId = req.user.id;

    if (id === gerenteId) {
      return res.status(403).json({
        message: "Acesso negado. Um gerente não pode desativar a si mesmo.",
      });
    }

    try {
      const funcionarioDesativado = await User.findOneAndUpdate(
        { _id: id, empresa: empresaId },
        { ativo: false },
        { new: true }
      );

      if (!funcionarioDesativado) {
        return res
          .status(404)
          .json({ message: "Funcionário não encontrado nesta empresa." });
      }

      res.status(200).json({ message: "Funcionário desativado com sucesso." });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao desativar funcionário.",
        error: error.message,
      });
    }
  }
};
