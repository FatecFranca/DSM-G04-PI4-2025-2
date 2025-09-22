const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

const ChamadoSchema = new Schema(
  {
    mesa_id: {
      type: Schema.Types.ObjectId,
      ref: "Mesa",
      required: true,
    },
    garcom_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
    },
    status: {
      type: String,
      required: true,
      enum: ["pendente", "atendido", "resolvido"],
      default: "pendente",
    },
    timestamp_atendimento: {
      type: Date,
    },
  },
  { timestamp: { createdAt: "timestamp_chamado" } }
);

const Chamado = mongoose.model("Chamado", ChamadoSchema);

module.exports = Chamado;
