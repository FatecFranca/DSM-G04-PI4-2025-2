const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

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
  },
  { timestamp: true }
);

const Mesa = mongoose.model("Mesa", MesaSchema);

module.exports = Mesa;
