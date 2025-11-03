const Conta = require("../models/Conta");
const Mesa = require("../models/Mesa");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class ContaController {
  static async abrirConta(req, res) {
    const { mesaId } = req.body;
    const empresaId = req.user.empresa;

    if (!mesaId) {
      return res.status(422).json({ message: "O ID da mesa é obrigatório." });
    }

    try {
      const mesa = await Mesa.findOne({ _id: mesaId, empresa: empresaId });
      if (!mesa) {
        return res.status(404).json({ message: "Mesa não encontrada." });
      }

      if (mesa.status !== "livre") {
        return res
          .status(409)
          .json({ message: `A Mesa ${mesa.numero} já está ocupada.` });
      }

      const novaConta = new Conta({
        mesa: mesa._id,
        empresa: empresaId,
        status: "aberta",
        valor_total: 0,
        valor_pago: 0,
      });
      await novaConta.save();

      mesa.status = "ocupada";
      mesa.conta_ativa = novaConta._id;
      await mesa.save();

      res.status(201).json({
        message: `Conta aberta com sucesso para a Mesa ${mesa.numero}`,
        conta: novaConta,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao abrir conta.", error: error.message });
    }
  }

  static async getContaAtivaDaMesa(req, res) {
    const mesaId = req.params.mesaId;
    const empresaId = req.user.empresa;
    if (!ObjectId.isValid(mesaId)) {
      return res.status(422).json({ message: "ID Inválido" });
    }
    try {
      const conta = await Conta.findOne({
        mesa: mesaId,
        empresa: empresaId,
        status: "aberta",
      }).populate({
        path: "pedidos",
        model: "Pedido",
        populate: [
          { path: "itens.item", model: "Cardapio", select: "nome preco" },
          { path: "garcom", model: "User", select: "nome" },
        ],
      });

      if (!conta) {
        return res
          .status(404)
          .json({ message: "Nenhuma conta ativa encontrada para esta mesa." });
      }

      res.status(200).json({ conta });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao buscar conta.", error: error.message });
    }
  }
  static async listarContas(req, res) {
    const empresaId = req.user.empresa;
    
    const { status, dataInicio, dataFim } = req.query;

    try {
      const query = { empresa: empresaId };

      if (status) {
        query.status = status;
      }

      if (dataInicio && dataFim) {
        query.data_fechamento = {
          $gte: new Date(dataInicio),
          $lte: new Date(dataFim),
        };
      } else if (dataInicio) {
        query.data_fechamento = { $gte: new Date(dataInicio) };
      } else if (dataFim) {
        query.data_fechamento = { $lte: new Date(dataFim) };
      }

      const contas = await Conta.find(query)
        .sort({ data_fechamento: -1 })
        .populate("mesa", "numero");

      if (!contas || contas.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma conta encontrada com esses filtros." });
      }

      res.status(200).json({ contas });

    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao listar contas.", error: error.message });
    }
  }
  static async cancelarConta(req, res) {
    const contaId = req.params.id;
    const empresaId = req.user.empresa;

    try {
      const conta = await Conta.findOne({ _id: contaId, empresa: empresaId });

      if (!conta) {
        return res.status(404).json({ message: "Conta não encontrada." });
      }
      if (conta.status === "fechada") {
        return res.status(409).json({
          message: "Não é possível cancelar uma conta que já foi fechada.",
        });
      }
      if (conta.valor_pago > 0) {
        return res.status(409).json({
          message:
            "Não é possível cancelar uma conta que já recebeu pagamentos.",
        });
      }
      if (conta.valor_total > 0) {
        return res.status(409).json({
          message:
            "Não é possível cancelar uma conta que já possui pedidos"
        });
      }
      conta.status = "cancelada";
      await conta.save();
      await Mesa.findByIdAndUpdate(conta.mesa, {
        status: "livre",
        conta_ativa: null,
      });

      res.status(200).json({ message: "Conta cancelada com sucesso." });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao cancelar conta.", error: error.message });
    }
  }
};
