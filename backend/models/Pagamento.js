const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Pagamento:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: O ID do pagamento gerado pelo MongoDB
 *           example: "69116e0b23b718a4bc86fb15"
 *         conta:
 *           type: string
 *           description: O ID da conta que recebeu este pagamento
 *           example: "69115a3c23b718a4bc86fa88"
 *         valor:
 *           type: number
 *           format: double
 *           description: O valor monetário do pagamento
 *           example: 50.00
 *         metodo:
 *           type: string
 *           enum: [dinheiro, cartao_credito, cartao_debito, pix]
 *           description: O método utilizado para o pagamento
 *           example: "pix"
 *         garcom_responsavel:
 *           type: string
 *           description: O ID do garçom que registrou o pagamento
 *           example: "690420336bcd67bbb0d6c3f1"
 *         empresa:
 *           type: string
 *           description: O ID da empresa proprietária
 *           example: "690420336bcd67bbb0d6c3f1"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data/hora que o pagamento foi registrado
 */

const PagamentoSchema = new Schema(
  {
    conta: {
      type: Schema.Types.ObjectId,
      ref: 'Conta',
      required: true,
    },
    valor: {
      type: Number,
      required: true,
    },
    metodo: {
      type: String,
      enum: ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'],
      required: true,
    },
    garcom_responsavel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: 'Empresa',
      required: true,
    },
  },
  { timestamps: true }
);

const Pagamento = mongoose.model('Pagamento', PagamentoSchema);
module.exports = Pagamento;
