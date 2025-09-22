const mongoose = require("../db/conn");
const { Schema } = require("mongoose");
const PedidoItem = new Shema({
  item: { type: Schema.Types.ObjectId, ref: "Cardapio", required: true },
  quantidade: { type: Number, required: true, min: 1 },
  preco_unitario: {type: Number, required: true},
  observacao: { type: String },
});

const PedidoSchema = new Schema(
  {
    mesa_id: {
      type: Schema.Types.ObjectId,
      ref: "Mesa",
      required: true,
    },
    garcom_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    cozinheiro_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
    },
    itens: [PedidoItem],
    status: {
        type: String,
        required: true,
        enum: ['enviado_cozinha', 'preparando', 'pronto', 'entregue'],
        default: 'enviado_cozinha'
    },
    observacoes_gerais: {
        type: String
    }
  },
  { timestamp: true }
);

const Pedido = mongoose.model("Pedido", PedidoSchema);

module.exports = Pedido;
