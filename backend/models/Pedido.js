const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoItem:
 *       type: object
 *       properties:
 *         item:
 *           type: string
 *           description: O _id do item no Cardápio
 *           example: "69042c059b1e8a3c1c8e4f5f"
 *         quantidade:
 *           type: number
 *           example: 2
 *         preco_unitario:
 *           type: number
 *           description: (Preenchido pelo backend) O preço do item no momento do pedido
 *           example: 25.50
 *         observacao:
 *           type: string
 *           example: "Sem cebola"
 *
 *     Pedido:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "69116a3c23b718a4bc86fb01"
 *         mesa:
 *           type: string
 *           description: ID da mesa
 *           example: "690420c46bcd67bbb0d6c403"
 *         garcom:
 *           type: string
 *           description: ID do garçom que registrou
 *           example: "690420336bcd67bbb0d6c3f1"
 *         cozinheiro:
 *           type: string
 *           description: ID do cozinheiro que preparou
 *           example: "690420999bcd67bbb0d6c999"
 *         itens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PedidoItem'
 *         status:
 *           type: string
 *           enum: [enviado_cozinha, preparando, pronto, entregue]
 *           example: "enviado_cozinha"
 *         observacoes_gerais:
 *           type: string
 *           example: "Alergia a amendoim"
 *         empresa:
 *           type: string
 *           description: ID da empresa
 *           example: "690420336bcd67bbb0d6c3f1"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do pedido
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 */

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
  { timestamps: true }
);

const Pedido = mongoose.model("Pedido", PedidoSchema);
module.exports = Pedido;
