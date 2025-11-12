const Pagamento = require("../models/Pagamento");
const Conta = require("../models/Conta");
const Mesa = require("../models/Mesa");
const ObjectId = require("mongoose").Types.ObjectId;
const {
  emitNovoPagamento,
  emitAtualizacaoConta,
  emitAtualizacaoMesa,
} = require("../websocket");

module.exports = class PagamentoController {
  static async adicionarPagamento(req, res) {
    const { contaId, valor, metodo } = req.body;
    const garcomId = req.user.id;
    const empresaId = req.user.empresa;

    if (!contaId || !valor || !metodo) {
      return res
        .status(422)
        .json({ message: "ID da conta, valor e método são obrigatórios." });
    }
    if (valor <= 0) {
      return res
        .status(422)
        .json({ message: "O valor do pagamento deve ser positivo." });
    }

    try {
      const conta = await Conta.findOne({ _id: contaId, empresa: empresaId });
      if (!conta) {
        return res.status(404).json({ message: "Conta não encontrada." });
      }
      if (conta.status !== "aberta") {
        return res
          .status(409)
          .json({ message: "Esta conta não está aberta para pagamentos." });
      }

      const novoPagamento = new Pagamento({
        conta: contaId,
        valor,
        metodo,
        garcom_responsavel: garcomId,
        empresa: empresaId,
      });
      await novoPagamento.save();

      const contaAtualizada = await Conta.findByIdAndUpdate(
        contaId,
        { $inc: { valor_pago: valor } },
        { new: true }
      );

      if (contaAtualizada.valor_pago >= contaAtualizada.valor_total) {
        contaAtualizada.status = "fechada";
        contaAtualizada.data_fechamento = new Date();
        await contaAtualizada.save();

        await Mesa.findByIdAndUpdate(conta.mesa, {
          status: "livre",
          conta_ativa: null,
        });

        // Emitir eventos WebSocket quando a conta for fechada
        emitAtualizacaoMesa(empresaId, {
          _id: conta.mesa,
          status: "livre",
          conta_ativa: null,
        });
      }

      // Emitir eventos WebSocket
      emitNovoPagamento(empresaId, {
        _id: novoPagamento._id,
        conta: contaId,
        valor: novoPagamento.valor,
        metodo: novoPagamento.metodo,
      });

      emitAtualizacaoConta(empresaId, {
        _id: contaAtualizada._id,
        valor_pago: contaAtualizada.valor_pago,
        valor_total: contaAtualizada.valor_total,
        status: contaAtualizada.status,
      });

      res.status(201).json({
        message: "Pagamento registrado com sucesso!",
        conta: contaAtualizada,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao registrar pagamento.",
        error: error.message,
      });
    }
  }

  static async listarPagamentosDaConta(req, res) {
    const contaId = req.params.contaId;
    const empresaId = req.user.empresa;
    if (!ObjectId.isValid(contaId)) {
      return res.status(422).json({ message: "ID Inválido" });
    }
    try {
      const pagamentos = await Pagamento.find({
        conta: contaId,
        empresa: empresaId,
      })
        .sort({ createdAt: 1 })
        .populate("garcom_responsavel", "nome");

      res.status(200).json({ pagamentos });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao buscar pagamentos.", error: error.message });
    }
  }
};
