const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Mesa:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: "O ID da mesa gerado pelo MongoDB"
 *           example: "690420c46bcd67bbb0d6c403"
 *         numero:
 *           type: number
 *           description: "O número de identificação da mesa (exemplo: 1, 2, 10)"
 *           example: 10
 *         id_botao:
 *           type: string
 *           description: "O ID de hardware único do botão físico"
 *           example: "BTN_HW_10"
 *         status:
 *           type: string
 *           enum: [livre, ocupada, aguardando_atendimento, aguardando_pagamento]
 *           description: "O status atual da mesa"
 *           example: "livre"
 *         conta_ativa:
 *           type: string
 *           description: "O ID (ObjectId) da conta que está aberta nesta mesa"
 *           example: null
 *         empresa:
 *           type: string
 *           description: "O ID da empresa proprietária"
 *           example: "690420336bcd67bbb0d6c3f1"
 *         ativo:
 *           type: boolean
 *           description: "Indica se a mesa está ativa no sistema"
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "Data de criação"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: "Data da última atualização"
 */

const MesaSchema = new Schema(
  {
    numero: {
      type: Number,
      required: true,
    },
    id_botao: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "livre",
        "ocupada",
        "aguardando_atendimento",
        "aguardando_pagamento",
      ],
      default: "livre",
    },
    conta_ativa: {
      type: Schema.Types.ObjectId,
      ref: "Conta",
      default: null,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Mesa = mongoose.model("Mesa", MesaSchema);

module.exports = Mesa;
