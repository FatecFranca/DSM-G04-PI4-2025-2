const mongoose = require('../db/conn');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshToken:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "69115a3c23b718a4bc86fa88"
 *         user:
 *           type: string
 *           description: O ID do usuário dono deste token
 *           example: "690420336bcd67bbb0d6c3f1"
 *         token:
 *           type: string
 *           description: A string do refresh token (JWT longo)
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Data/hora que o token será automaticamente deletado do banco
 */

const RefreshTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: '8d',
  },
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
