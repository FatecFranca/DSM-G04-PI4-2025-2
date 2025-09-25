const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

const ContaSchema = new Schema(
  {
    mesa_id: {
      type: Schema.Types.ObjectId,
      ref: "Mesa",
      required: true,
    },
    pedidos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Pedido",
      },
    ],
    valor_total: {
      type: Number,
      default: 0,
    },
    valor_pago: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["aberta", "fechado", "cancelado"],
      default: "aberta",
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
    timestamp_fechamento: {
      type: Date,
    },
  },
  { timestamp: { createdAt: "timestamp_abertura" } }
);

const Conta = mongoose.model("Conta", ContaSchema);

module.exports = Conta;
