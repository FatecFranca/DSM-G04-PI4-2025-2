const createUserToken = require("../helpers/createUserToken");
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
    await createUserToken(user, req, res);
  }
  static async getAllFuncionarios(req, res) {
    const empresaId = req.user.empresa;

    try {
      const funcionarios = await User.find({ empresa: empresaId }).select(
        "-senha -pin"
      );
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
      const funcionario = await User.findOne({ _id: id, empresa: empresaId });
      if (!funcionario) {
        return res.status(404).json({ message: "Funcionário não encontrado nesta empresa" });
      }
      return res.status(200).json({ funcionario: funcionario });
    } catch (err) {
      res.status(500).json({
        message: "Erro ao buscar funcionário.",
        error: err.message,
      });
    }
  }
};
