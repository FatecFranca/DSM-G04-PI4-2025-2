const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Cardapio:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "69115a3c23b718a4bc86fa88"
 *         nome:
 *           type: string
 *           description: Nome do item do cardápio
 *           example: "Coca-Cola Zero"
 *         descricao:
 *           type: string
 *           description: Descrição do item
 *           example: "Lata 350ml"
 *         preco:
 *           type: number
 *           description: Preço do item
 *           example: 6.50
 *         categoria:
 *           type: string
 *           enum: [bebida, prato_principal, sobremesa, entrada]
 *           description: Categoria do item no cardápio
 *           example: "bebida"
 *         disponivel:
 *           type: boolean
 *           description: Indica se o item está disponível
 *           example: true
 *         empresa:
 *           type: string
 *           description: ID da empresa à qual o item pertence
 *           example: "690420336bcd67bbb0d6c3f1"
 */

const CardapioSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
    },
    preco: {
      type: Number,
      required: true,
    },
    categoria: {
      type: String,
      required: true,
      enum: ["bebida", "prato_principal", "sobremesa", "entrada"],
    },
    disponivel: {
      type: Boolean,
      default: true,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
  },
  { timestamps: true } 
);

const Cardapio = mongoose.model("Cardapio", CardapioSchema);
module.exports = Cardapio;
