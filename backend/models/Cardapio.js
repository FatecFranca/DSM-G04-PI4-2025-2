const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

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
        default: true
    }
  },
  { timestamp: true }
);

const Cardapio = mongoose.model("Cardapio", CardapioSchema);

module.exports = Cardapio;
