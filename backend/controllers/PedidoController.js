const Cardapio = require("../models/Cardapio");
const Pedido = require("../models/Pedido");
const Mesa = require("../models/Mesa");
const Conta = require("../models/Conta");
const ObjectId = require("mongoose").Types.ObjectId;
const { emitNovoPedido, emitAtualizacaoPedido } = require("../websocket");

module.exports = class PedidoController {
  static async criarPedido(req, res) {
    const mesaId = req.params.mesaId;
    const garcomId = req.user.id;
    const empresaId = req.user.empresa;

    if (!ObjectId.isValid(mesaId)) {
      return res.status(422).json({ message: "ID Inválido" });
    }
    const { itens, observacoes_gerais } = req.body;

    if (!itens || itens.length === 0) {
      return res
        .status(422)
        .json({ message: "O pedido não pode estar vazio." });
    }

    try {
      const mesa = await Mesa.findOne({ _id: mesaId, empresa: empresaId });
      if (!mesa || !mesa.conta_ativa) {
        return res.status(404).json({
          message: "Mesa não encontrada ou não possui uma conta aberta.",
        });
      }
      const contaId = mesa.conta_ativa;

      let valorTotalDoPedido = 0;
      const itensParaSalvar = [];

      for (const itemPedido of itens) {
        const cardapioItem = await Cardapio.findOne({
          _id: itemPedido.item,
          empresa: empresaId,
        });

        if (!cardapioItem) {
          return res.status(404).json({
            message: `Item com ID ${itemPedido.item} não encontrado no cardápio.`,
          });
        }
        if (!cardapioItem.disponivel) {
          return res.status(409).json({
            message: `O item '${cardapioItem.nome}' está indisponível.`,
          });
        }

        const subtotal = cardapioItem.preco * itemPedido.quantidade;
        valorTotalDoPedido += subtotal;

        itensParaSalvar.push({
          item: cardapioItem._id,
          quantidade: itemPedido.quantidade,
          preco_unitario: cardapioItem.preco,
          observacao: itemPedido.observacao,
        });
      }

      const novoPedido = new Pedido({
        empresa: empresaId,
        conta: contaId,
        mesa: mesaId,
        garcom: garcomId,
        itens: itensParaSalvar,
        observacoes_gerais: observacoes_gerais,
        status: "enviado_cozinha",
      });
      await novoPedido.save();

      await Conta.findOneAndUpdate(
        { mesa: mesaId, status: "aberta" },
        {
          $push: { pedidos: novoPedido._id },
          $inc: { valor_total: valorTotalDoPedido },
        }
      );

      // Emitir evento WebSocket de novo pedido
      emitNovoPedido(empresaId, {
        _id: novoPedido._id,
        mesa: mesaId,
        status: novoPedido.status,
        itens: novoPedido.itens,
        observacoes_gerais: novoPedido.observacoes_gerais,
      });

      res.status(201).json({
        message: "Pedido enviado para a cozinha!",
        pedido: novoPedido,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao criar pedido.", error: error.message });
    }
  }

  static async iniciarPreparo(req, res) {
    const pedidoId = req.params.id;
    const cozinheiroId = req.user.id;
    const empresaId = req.user.empresa;

    try {
      const pedido = await Pedido.findOne({
        _id: pedidoId,
        empresa: empresaId,
      });

      if (!pedido)
        return res.status(404).json({ message: "Pedido não encontrado." });
      if (pedido.status !== "enviado_cozinha") {
        return res
          .status(409)
          .json({ message: "Este pedido já está sendo preparado." });
      }

      pedido.status = "preparando";
      pedido.cozinheiro = cozinheiroId;
      await pedido.save();

      // Emitir evento WebSocket de atualização
      emitAtualizacaoPedido(empresaId, {
        _id: pedido._id,
        status: pedido.status,
        cozinheiro: pedido.cozinheiro,
      });

      res.status(200).json({ message: "Preparo iniciado!", pedido });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao iniciar preparo.", error: error.message });
    }
  }

  static async marcarComoPronto(req, res) {
    const pedidoId = req.params.id;
    const cozinheiroId = req.user.id;

    try {
      const pedido = await Pedido.findOne({
        _id: pedidoId,
        cozinheiro: cozinheiroId,
      });

      if (!pedido)
        return res
          .status(404)
          .json({ message: "Pedido não encontrado ou não pertence a você." });
      if (pedido.status !== "preparando") {
        return res
          .status(409)
          .json({ message: "Este pedido não estava em preparo." });
      }

      pedido.status = "pronto";
      await pedido.save();

      // Emitir evento WebSocket de atualização
      emitAtualizacaoPedido(pedido.empresa, {
        _id: pedido._id,
        status: pedido.status,
        mesa: pedido.mesa,
        garcom: pedido.garcom,
      });

      res.status(200).json({ message: "Pedido pronto para entrega!", pedido });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao finalizar pedido.", error: error.message });
    }
  }

  static async marcarComoEntregue(req, res) {
    const pedidoId = req.params.id;
    const garcomId = req.user.id;

    try {
      const pedido = await Pedido.findOne({
        _id: pedidoId,
        empresa: req.user.empresa,
      });
      if (!pedido)
        return res.status(404).json({ message: "Pedido não encontrado." });

      if (
        pedido.garcom.toString() !== garcomId &&
        req.user.cargo !== "gerente"
      ) {
        return res.status(403).json({
          message: "Você não tem permissão para entregar este pedido.",
        });
      }
      if (pedido.status !== "pronto") {
        return res
          .status(409)
          .json({ message: "Este pedido ainda não estava pronto." });
      }

      pedido.status = "entregue";
      await pedido.save();

      // Emitir evento WebSocket de atualização
      emitAtualizacaoPedido(pedido.empresa, {
        _id: pedido._id,
        status: pedido.status,
      });

      res.status(200).json({ message: "Pedido entregue ao cliente!", pedido });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao entregar pedido.", error: error.message });
    }
  }

  static async listarPedidosCozinha(req, res) {
    const empresaId = req.user.empresa;

    try {
      const pedidosParaCozinha = await Pedido.find({
        empresa: empresaId,
        status: { $in: ["enviado_cozinha", "preparando"] },
      })
        .sort({ createdAt: 1 })
        .populate("mesa", "numero")
        .populate("itens.item", "nome");

      res.status(200).json({ pedidos: pedidosParaCozinha });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar pedidos da cozinha.",
        error: error.message,
      });
    }
  }

  static async listarPedidosProntosGarcom(req, res) {
    const empresaId = req.user.empresa;
    const garcomId = req.user.id;

    try {
      const pedidosProntos = await Pedido.find({
        empresa: empresaId,
        garcom: garcomId,
        status: "pronto",
      })
        .sort({ createdAt: 1 })
        .populate("mesa", "numero");

      res.status(200).json({ pedidos: pedidosProntos });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar pedidos prontos.",
        error: error.message,
      });
    }
  }
};
