const mongoose = require("../db/conn");
const { Schema } = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: O ID do usuário gerado pelo MongoDB
 *           example: "690420336bcd67bbb0d6c3f1"
 *         nome:
 *           type: string
 *           description: O nome do usuário
 *           example: "Paulo Gerente"
 *         email:
 *           type: string
 *           description: O e-mail de login (único por empresa)
 *           example: "paulo@restaurante.com"
 *         cpf:
 *           type: string
 *           description: O CPF (único por empresa)
 *           example: "12345678900"
 *         cargo:
 *           type: string
 *           enum: [garcom, cozinheiro, gerente]
 *           description: O cargo do usuário no sistema
 *           example: "gerente"
 *         empresa:
 *           type: string
 *           description: O ID da empresa à qual o usuário pertence
 *           example: "690420336bcd67bbb0d6c3f1"
 *         ativo:
 *           type: boolean
 *           description: Indica se o usuário está ativo (pode logar)
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
      default: true,
    },
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
