const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmpresaSchema = new Schema({
    nomeEmpresa: {
        type: String,
        required: true
    },  
    tipo: {
        type: String,
        enum: ['Restaurante', 'Bar', 'Cafeteria', 'Outro'],
        required: true
    },
    cnpj: {
        type: String,
        required: true,
        unique: true
    },
    ativo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Empresa = mongoose.model('Empresa', EmpresaSchema)
module.exports = Empresa