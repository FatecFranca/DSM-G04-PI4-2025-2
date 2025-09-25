const Empresa = require("../models/Empresa");
const User = require("../models/User");
const createUserToken = require("../helpers/createUserToken");
const { validarEmail, validarCPF } = require("../helpers/validations");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class EmpresaController {
  static async register(req, res) {
    const {
      nomeCompleto,
      email,
      cpf,
      senha,
      confirmarSenha,
      nomeEmpresa,
      tipo,
      cnpj,
    } = req.body;

    if (
      !nomeCompleto ||
      !email ||
      !cpf ||
      !senha ||
      !confirmarSenha ||
      !nomeEmpresa ||
      !tipo ||
      !cnpj
    ) {
      return res
        .status(422)
        .json({ message: "Todos os campos são obrigatórios." });
    }
    if (senha !== confirmarSenha) {
      return res.status(422).json({ message: "As senhas não conferem." });
    }
    if (!validarEmail(email)) {
      return res
        .status(422)
        .json({ message: "O formato do e-mail é inválido." });
    }

    const cnpjLimpo = cnpj.replace(/\D/g, "");
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (!validarCPF(cpf)) {
      return res.status(422).json({ message: "O CPF é inválido." });
    }
    if (cnpjLimpo.length !== 14) {
      return res.status(422).json({ message: "O CNPJ é inválido." });
    }

    const adminExists = await User.findOne({ email: email });
    const empresaExists = await Empresa.findOne({ cnpj: cnpjLimpo });

    if (adminExists) {
      return res.status(409).json({ message: "Este e-mail já está em uso." });
    }
    if (empresaExists) {
      return res.status(409).json({ message: "Este CNPJ já está cadastrado." });
    }

    try {
      const novaEmpresa = new Empresa({
        nomeEmpresa: nomeEmpresa,
        tipo: tipo,
        cnpj: cnpjLimpo,
      });
      await novaEmpresa.save();

      const novoAdmin = new User({
        nome: nomeCompleto,
        email: email,
        cpf: cpfLimpo,
        senha: senha,
        cargo: "gerente",
        empresa: novaEmpresa._id,
      });
      await novoAdmin.save();

      await createUserToken(novoAdmin, req, res);
    } catch (err) {
      res.status(500).json({
        message: "Ocorreu um erro ao processar seu cadastro.",
        error: err.message,
      });
    }
  }
  static async getEmpresa(req, res) {
    const empresaId = req.user.empresa;
    const cargo = req.user.cargo;
    try {
      let empresa;
      if (cargo === "gerente") {
        empresa = await Empresa.findById(empresaId);
      } else {
        empresa = await Empresa.findById(empresaId).select("nomeEmpresa tipo");
      }
      if (!empresa) {
        return res.status(404).json({ message: "Empresa não encontrada." });
      }
      if (!empresa.ativo) {
        return res.status(403).json({ message: "Esta empresa está inativa." });
      }
      return res.status(200).json({ empresa: empresa });
    } catch (err) {
      res.status(500).json({
        message: "Erro ao buscar dados da empresa.",
        error: err.message,
      });
    }
  }
  static async updateEmpresa(req, res) {
    const empresaId = req.user.empresa;
    const updateData = {};
    const camposPermitidos = ["nomeEmpresa", "tipo"];
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
      const updatedEmpresa = await Empresa.findByIdAndUpdate(
        empresaId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!updatedEmpresa) {
        return res.status(404).json({ message: "Empresa não encontrada." });
      }
      res
        .status(200)
        .json({
          message: "Empresa atualizada com sucesso!",
          empresa: updatedEmpresa,
        });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erro ao atualizar empresa.", error: err.message });
    }
  }
  static async deleteEmpresa(req, res) {
    const empresaId = req.user.empresa;
    try {
      const empresa = await Empresa.findByIdAndUpdate(
        empresaId,
        { $set: { ativo: false } },
        { new: true, runValidators: true }
      );
      if (!empresa) {
        return res.status(404).json({ message: "Empresa não encontrada." });
      }
      await User.updateMany({ empresa: empresaId }, { ativo: false });
      res
        .status(200)
        .json({
          message: "Sua conta e de seus funcionários foram desativadas.",
        });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erro ao desativar empresa.", error: err.message });
    }
  }
};
