const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Empresa:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: O ID da empresa gerado pelo MongoDB
 *           example: "690420336bcd67bbb0d6c3f1"
 *         nomeEmpresa:
 *           type: string
 *           description: O nome fantasia da empresa
 *           example: "Restaurante do Paulo"
 *         tipo:
 *           type: string
 *           enum: [Restaurante, Bar, Cafeteria, Outro]
 *           description: O tipo de estabelecimento
 *           example: "Restaurante"
 *         cnpj:
 *           type: string
 *           description: O CNPJ da empresa (único)
 *           example: "12345678000199"
 *         ativo:
 *           type: boolean
 *           description: Se a empresa está ativa no sistema
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 */

const EmpresaSchema = new Schema(
  {
    nomeEmpresa: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ['Restaurante', 'Bar', 'Cafeteria', 'Outro'],
      required: true,
    },
    cnpj: {
      type: String,
      required: true,
      unique: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Empresa = mongoose.model('Empresa', EmpresaSchema);
module.exports = Empresa;
