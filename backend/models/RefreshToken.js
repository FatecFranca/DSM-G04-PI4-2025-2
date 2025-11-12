const mongoose = require('../db/conn');
const Schema = mongoose.Schema;

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