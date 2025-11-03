const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PagamentoSchema = new Schema({
    conta: {
        type: Schema.Types.ObjectId,
        ref: 'Conta',
        required: true,
    },
    valor: {
        type: Number,
        required: true,
    },
    metodo: {
        type: String,
        enum: ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'],
        required: true,
    },
    garcom_responsavel: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
}, { timestamps: true });

const Pagamento = mongoose.model("Pagamento", PagamentoSchema);
module.exports = Pagamento