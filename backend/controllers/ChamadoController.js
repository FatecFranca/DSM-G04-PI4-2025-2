const Chamado = require("../models/Chamado");
const Mesa = require("../models/Mesa");
const Conta = require("../models/Conta");
const {
  emitNovoChamado,
  emitAtualizacaoChamado,
  emitAtualizacaoMesa,
  emitNovaConta,
} = require("../websocket");

module.exports = class ChamadoController {
  static async criarChamado(req, res) {
    const { id_botao } = req.body;

    if (!id_botao) {
      return res.status(422).json({ message: "O ID do botão é obrigatório." });
    }

    try {
      const mesa = await Mesa.findOne({ id_botao: id_botao });

      if (!mesa) {
        return res
          .status(404)
          .json({ message: "Botão não cadastrado. Mesa não encontrada." });
      }

      if (mesa.status === "livre") {
        const novaConta = new Conta({ mesa: mesa._id, empresa: mesa.empresa });
        await novaConta.save();
        mesa.conta_ativa = novaConta._id;

        emitNovaConta(mesa.empresa, {
          _id: novaConta._id,
          mesa: mesa._id,
          status: novaConta.status,
        });
      }

      const chamadoPendente = await Chamado.findOne({
        mesa: mesa._id,
        status: "pendente",
      });
      if (chamadoPendente) {
        return res
          .status(409)
          .json({ message: "Esta mesa já possui um chamado pendente." });
      }

      const novoChamado = new Chamado({
        mesa: mesa._id,
        empresa: mesa.empresa,
      });

      mesa.status = "aguardando_atendimento";

      await novoChamado.save();
      await mesa.save();

      emitNovoChamado(mesa.empresa, {
        _id: novoChamado._id,
        mesa: { _id: mesa._id, numero: mesa.numero },
        status: novoChamado.status,
        createdAt: novoChamado.createdAt,
      });

      emitAtualizacaoMesa(mesa.empresa, {
        _id: mesa._id,
        numero: mesa.numero,
        status: mesa.status,
        conta_ativa: mesa.conta_ativa,
      });

      res.status(201).json({
        message: `Chamado criado para a Mesa ${mesa.numero}!`,
        chamado: novoChamado,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro interno no servidor.", error: error.message });
    }
  }

  static async aceitarChamado(req, res) {
    const chamadoId = req.params.id;
    const garcomId = req.user.id;

    try {
      const chamado = await Chamado.findById(chamadoId);

      if (
        !chamado ||
        chamado.empresa.toString() !== req.user.empresa.toString()
      ) {
        return res.status(404).json({ message: "Chamado não encontrado." });
      }

      if (chamado.status !== "pendente") {
        return res
          .status(409)
          .json({ message: "Este chamado já foi atendido." });
      }

      chamado.garcom = garcomId;
      chamado.status = "atendido";
      chamado.timestamp_atendimento = new Date();
      await chamado.save();

      await Mesa.findByIdAndUpdate(chamado.mesa, { status: "ocupada" });

      emitAtualizacaoChamado(chamado.empresa, {
        _id: chamado._id,
        status: chamado.status,
        garcom: chamado.garcom,
      });

      emitAtualizacaoMesa(chamado.empresa, {
        _id: chamado.mesa,
        status: "ocupada",
      });

      res.status(200).json({ message: "Chamado aceito com sucesso!", chamado });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao aceitar chamado.", error: error.message });
    }
  }

  static async resolverChamado(req, res) {
    const chamadoId = req.params.id;
    const garcomId = req.user.id;

    try {
      const chamado = await Chamado.findOne({
        _id: chamadoId,
        garcom: garcomId,
      });
      if (!chamado) {
        return res
          .status(404)
          .json({ message: "Chamado não encontrado ou não pertence a você." });
      }

      chamado.status = "resolvido";
      await chamado.save();

      emitAtualizacaoChamado(chamado.empresa, {
        _id: chamado._id,
        status: chamado.status,
      });

      res.status(200).json({ message: "Atendimento finalizado com sucesso." });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao resolver chamado.", error: error.message });
    }
  }

  static async listarPendentes(req, res) {
    const empresaId = req.user.empresa;
    try {
      const chamadosPendentes = await Chamado.find({
        empresa: empresaId,
        status: "pendente",
      })
        .sort({ createdAt: 1 })
        .populate("mesa", "numero");

      res.status(200).json({ chamados: chamadosPendentes });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar chamados pendentes.",
        error: error.message,
      });
    }
  }
};
