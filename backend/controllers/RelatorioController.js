const Conta = require("../models/Conta");
const Pedido = require("../models/Pedido");
const Pagamento = require("../models/Pagamento");
const Chamado = require("../models/Chamado");
const mongoose = require("mongoose");
const ss = require("simple-statistics");

const criarFiltroData = (
  dataInicio,
  dataFim,
  campoData = "data_fechamento"
) => {
  if (dataInicio && dataFim) {
    const inicio = new Date(dataInicio + "T00:00:00.000Z");
    const fim = new Date(dataFim + "T23:59:59.999Z");

    return {
      [campoData]: {
        $gte: inicio,
        $lte: fim,
      },
    };
  }
  return {};
};

module.exports = class RelatorioController {
  static async getKPIs(req, res) {
    const empresaId = req.user.empresa;
    const filtroData = criarFiltroData(req.query.dataInicio, req.query.dataFim);
    try {
      const stats = await Conta.aggregate([
        {
          $match: {
            empresa: new mongoose.Types.ObjectId(empresaId),
            status: "fechada",
            ...filtroData,
          },
        },
        {
          $group: {
            _id: "$empresa",
            faturamentoTotal: { $sum: "$valor_total" },
            totalContas: { $sum: 1 },
            media: { $avg: "$valor_total" },
            desvioPadrao: { $stdDevPop: "$valor_total" },
          },
        },
      ]);

      if (stats.length === 0) {
        return res.status(200).json({
          faturamentoTotal: 0,
          totalContas: 0,
          media: 0,
          desvioPadrao: 0,
          intervaloConfianca: {},
        });
      }

      const { media, desvioPadrao, totalContas } = stats[0];
      const Z = 1.96;
      const margemDeErro = Z * (desvioPadrao / Math.sqrt(totalContas));
      const ic = {
        nivelConfianca: "95%",
        media: media.toFixed(2),
        margemDeErro: margemDeErro.toFixed(2),
        limiteInferior: (media - margemDeErro).toFixed(2),
        limiteSuperior: (media + margemDeErro).toFixed(2),
      };

      const resultado = {
        faturamentoTotal: stats[0].faturamentoTotal,
        totalContas: stats[0].totalContas,
        ticketMedio: stats[0].media,
        desvioPadrao: stats[0].desvioPadrao,
        intervaloConfiancaTicketMedio: ic,
      };

      res.status(200).json(resultado);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao buscar KPIs.", error: error.message });
    }
  }

  static async getPrevisaoVendas(req, res) {
    const empresaId = req.user.empresa;
    const filtroData = criarFiltroData(req.query.dataInicio, req.query.dataFim);

    try {
      const vendasPorDia = await Conta.aggregate([
        {
          $match: {
            empresa: new mongoose.Types.ObjectId(empresaId),
            status: "fechada",
            ...filtroData,
          },
        },
        {
          $project: {
            dia: {
              $dateToString: { format: "%Y-%m-%d", date: "$data_fechamento" },
            },
            valor_total: 1,
          },
        },
        {
          $group: {
            _id: "$dia",
            faturamentoDia: { $sum: "$valor_total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      if (vendasPorDia.length < 2) {
        return res
          .status(404)
          .json({ message: "Dados insuficientes para calcular regressão." });
      }
      const dadosParaRegressao = vendasPorDia.map((dia, index) => [
        index + 1,
        dia.faturamentoDia,
      ]);
      const dadosX_dias = vendasPorDia.map((_, index) => index + 1);
      const dadosY_faturamento = vendasPorDia.map((dia) => dia.faturamentoDia);

      const correlacao_r = ss.sampleCorrelation(
        dadosX_dias,
        dadosY_faturamento
      );
      const modeloLinear = ss.linearRegression(dadosParaRegressao);
      const linhaDePrevisao = ss.linearRegressionLine(modeloLinear);
      const proximoDia_X = dadosParaRegressao.length + 1;
      const previsaoProximoDia_Y = linhaDePrevisao(proximoDia_X);

      const labelsDoGrafico = vendasPorDia.map((dia) => dia._id);
      const dadosDoGrafico = vendasPorDia.map((dia) => dia.faturamentoDia);

      const faturamentoPrevistoLimpo = Math.max(0, previsaoProximoDia_Y);

      res.status(200).json({
        chartData: {
          labels: labelsDoGrafico,
          data: dadosDoGrafico,
        },

        estatisticas: {
          correlacao_r: correlacao_r.toFixed(4),
          R_squared: (correlacao_r * correlacao_r).toFixed(4),
          equacao: `Y = ${modeloLinear.m.toFixed(
            2
          )}X + ${modeloLinear.b.toFixed(2)}`,
        },

        previsao: {
          proximoPeriodoLabel: `Dia ${proximoDia_X}`,
          faturamentoPrevisto: faturamentoPrevistoLimpo.toFixed(2),
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao calcular previsão.", error: error.message });
    }
  }
  static async getItensMaisVendidos(req, res) {
    const empresaId = req.user.empresa;

    try {
      const topItens = await Pedido.aggregate([
        { $match: { empresa: new mongoose.Types.ObjectId(empresaId) } },
        { $unwind: "$itens" },
        {
          $group: {
            _id: "$itens.item",
            contagem: { $sum: "$itens.quantidade" },
          },
        },
        { $sort: { contagem: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "cardapios",
            localField: "_id",
            foreignField: "_id",
            as: "itemInfo",
          },
        },
        { $unwind: "$itemInfo" },
        {
          $project: {
            _id: 0,
            nomeItem: "$itemInfo.nome",
            quantidadeVendida: "$contagem",
          },
        },
      ]);

      res.status(200).json(topItens);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao buscar top itens.", error: error.message });
    }
  }
  static async getEstatisticasVendas(req, res) {
    const empresaId = req.user.empresa;
    const filtroData = criarFiltroData(req.query.dataInicio, req.query.dataFim);

    try {
      const contas = await Conta.find(
        {
          empresa: new mongoose.Types.ObjectId(empresaId),
          status: "fechada",
          ...filtroData,
        },
        "valor_total -_id"
      ).lean();

      if (contas.length < 3) {
        return res.status(404).json({ message: "Dados insuficientes." });
      }

      const valores = contas.map((c) => c.valor_total);

      let moda;
      try {
        moda = ss.mode(valores);
      } catch (e) {
        moda = "Nenhuma moda encontrada";
      }

      res.status(200).json({
        totalValores: valores.length,
        mediana: ss.median(valores),
        moda: moda,
        assimetria: ss.sampleSkewness(valores),
        valoresBrutos: valores,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao calcular estatísticas.",
        error: error.message,
      });
    }
  }
  static async getMetodosPagamento(req, res) {
    const empresaId = req.user.empresa;

    const filtroData = criarFiltroData(
      req.query.dataInicio,
      req.query.dataFim,
      "createdAt"
    );

    try {
      const stats = await Pagamento.aggregate([
        {
          $match: {
            empresa: new mongoose.Types.ObjectId(empresaId),
            ...filtroData,
          },
        },
        {
          $group: {
            _id: "$metodo",
            contagem: { $sum: 1 },
          },
        },
        { $sort: { contagem: -1 } },
        {
          $project: {
            _id: 0,
            metodo: "$_id",
            contagem: 1,
          },
        },
      ]);

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar métodos de pagamento.",
        error: error.message,
      });
    }
  }
  static async getMeuDesempenhoAtendimento(req, res) {
    const empresaId = req.user.empresa;
    const garcomId = req.user.id;
    const filtroData = criarFiltroData(
      req.query.dataInicio,
      req.query.dataFim,
      "createdAt"
    );

    try {
      const stats = await Chamado.aggregate([
        {
          $match: {
            empresa: new mongoose.Types.ObjectId(empresaId),
            garcom: new mongoose.Types.ObjectId(garcomId),
            status: { $ne: "pendente" },
            timestamp_atendimento: { $exists: true },
            ...filtroData,
          },
        },
        {
          $project: {
            tempoDeEspera_ms: {
              $subtract: ["$timestamp_atendimento", "$createdAt"],
            },
            garcom: 1,
          },
        },
        {
          $group: {
            _id: "$garcom",
            tempoMedio_ms: { $avg: "$tempoDeEspera_ms" },
            totalChamados: { $sum: 1 },
          },
        },
      ]);

      if (stats.length === 0) {
        return res.status(200).json({
          tempoMedioSegundos: 0,
          totalChamados: 0,
          nomeGarcom: req.user.nome,
        });
      }

      const tempoMedioEmSegundos = (stats[0].tempoMedio_ms / 1000).toFixed(2);

      res.status(200).json({
        tempoMedioSegundos: parseFloat(tempoMedioEmSegundos),
        totalChamados: stats[0].totalChamados,
        nomeGarcom: req.user.nome,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erro ao calcular seu tempo de atendimento.",
          error: error.message,
        });
    }
  }
  static async getMeuDesempenhoVendas(req, res) {
    const empresaId = req.user.empresa;
    const garcomId = req.user.id;
    const filtroData = criarFiltroData(
      req.query.dataInicio,
      req.query.dataFim,
      "createdAt"
    );

    try {
      const stats = await Pedido.aggregate([
        {
          $match: {
            empresa: new mongoose.Types.ObjectId(empresaId),
            garcom: new mongoose.Types.ObjectId(garcomId),
            ...filtroData,
          },
        },
        { $unwind: "$itens" },
        {
          $project: {
            pedidoId: "$_id",
            subtotal_item: {
              $multiply: ["$itens.quantidade", "$itens.preco_unitario"],
            },
          },
        },
        {
          $group: {
            _id: "$pedidoId",
            valor_total_do_pedido: { $sum: "$subtotal_item" },
          },
        },
        {
          $group: {
            _id: null,
            faturamentoTotal: { $sum: "$valor_total_do_pedido" },
            totalPedidos: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            faturamentoTotal: 1,
            totalPedidos: 1,
            ticketMedio: { $divide: ["$faturamentoTotal", "$totalPedidos"] },
          },
        },
      ]);

      if (stats.length === 0) {
        return res
          .status(200)
          .json({ faturamentoTotal: 0, totalPedidos: 0, ticketMedio: 0 });
      }

      res.status(200).json(stats[0]);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erro ao calcular seu desempenho de vendas.",
          error: error.message,
        });
    }
  }
};
