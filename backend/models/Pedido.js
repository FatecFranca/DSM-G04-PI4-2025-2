const mongoose = require("../db/conn");
const { Schema } = require("mongoose");
const PedidoItem = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "Cardapio", required: true },
  quantidade: { type: Number, required: true, min: 1 },
  preco_unitario: { type: Number, required: true },
  observacao: { type: String },
});

const PedidoSchema = new Schema(
  {
    mesa: {
      type: Schema.Types.ObjectId,
      ref: "Mesa",
      required: true,
    },
    garcom: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cozinheiro: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    itens: [PedidoItem],
    status: {
      type: String,
      required: true,
      enum: ["enviado_cozinha", "preparando", "pronto", "entregue"],
      default: "enviado_cozinha",
    },
    observacoes_gerais: {
      type: String,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
  },
  { timestamp: true }
);

const Pedido = mongoose.model("Pedido", PedidoSchema);

module.exports = Pedido;
