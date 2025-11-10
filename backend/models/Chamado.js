const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

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
