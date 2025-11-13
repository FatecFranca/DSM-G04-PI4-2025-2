const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Chamado:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID do chamado
 *           example: "69114f4f23b718a4bc86fa67"
 *         mesa:
 *           type: string
 *           description: ID da mesa que chamou
 *           example: "690420336bcd67bbb0d6c3f1"
 *         garcom:
 *           type: string
 *           description: ID do garçom que atendeu
 *           example: "69113f1c23b718a4bc86f999"
 *         status:
 *           type: string
 *           enum: [pendente, atendido, resolvido]
 *           description: Status atual do chamado
 *           example: "pendente"
 *         empresa:
 *           type: string
 *           description: ID da empresa
 *           example: "690420336bcd67bbb0d6c3f1"
 *         timestamp_chamado:
 *           type: string
 *           format: date-time
 *           description: Data/hora que o chamado foi criado
 *         timestamp_atendimento:
 *           type: string
 *           format: date-time
 *           description: Data/hora que o garçom aceitou
 */

const ChamadoSchema = new Schema(
  {
    mesa: {
      type: Schema.Types.ObjectId,
      ref: "Mesa",
      required: true,
    },
    garcom: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: ["pendente", "atendido", "resolvido"],
      default: "pendente",
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
    timestamp_atendimento: {
      type: Date,
    },
  },
  { timestamps: true } 
);

const Chamado = mongoose.model("Chamado", ChamadoSchema);

module.exports = Chamado;
