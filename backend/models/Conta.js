const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Conta:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: O ID da conta gerado pelo MongoDB
 *           example: "69115a3c23b718a4bc86fa88"
 *         mesa:
 *           type: string
 *           description: O ID da mesa associada
 *           example: "690420c46bcd67bbb0d6c403"
 *         pedidos:
 *           type: array
 *           description: Lista de IDs de pedidos associados a esta conta
 *           items:
 *             type: string
 *           example: ["69116a3c23b718a4bc86fb01", "69116b3c23b718a4bc86fb05"]
 *         valor_total:
 *           type: number
 *           format: double
 *           description: Valor total da conta
 *           example: 120.50
 *         valor_pago:
 *           type: number
 *           format: double
 *           description: Valor já pago
 *           example: 50.00
 *         status:
 *           type: string
 *           enum: [aberta, fechada, cancelada]
 *           description: Status atual da conta
 *           example: "aberta"
 *         empresa:
 *           type: string
 *           description: O ID da empresa proprietária
 *           example: "690420336bcd67bbb0d6c3f1"
 *         data_fechamento:
 *           type: string
 *           format: date-time
 *           description: Data/hora do fechamento da conta
 *         timestamp_abertura:
 *           type: string
 *           format: date-time
 *           description: Data/hora da abertura da conta (criado automaticamente)
 */

const ContaSchema = new Schema(
  {
    mesa: {
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
      enum: ["aberta", "fechada", "cancelada"],
      default: "aberta",
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
    data_fechamento: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "timestamp_abertura" }}
);

const Conta = mongoose.model("Conta", ContaSchema);
module.exports = Conta;
