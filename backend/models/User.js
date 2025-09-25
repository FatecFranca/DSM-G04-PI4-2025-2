const mongoose = require("../db/conn");
const { Schema } = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
    },
    senha: {
      type: String,
    },
    pin: {
      type: String,
    },
    cargo: {
      type: String,
      required: true,
      enum: ["garcom", "cozinheiro", "gerente"],
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("senha")) {
    const salt = await bcrypt.genSalt(12);
    this.senha = await bcrypt.hash(this.senha, salt);
  }
  if (this.isModified("pin")) {
    const pinGerado = this.cpf.substring(0, 4);
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(pinGerado, salt);
  }
  next();
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
