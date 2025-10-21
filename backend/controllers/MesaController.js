const Mesa = require('../models/Mesa');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class MesaController {

    static async createMesa(req, res) {
        const { numero, id_botao } = req.body;
        const empresaId = req.user.empresa;

        if (!numero || !id_botao) {
            return res.status(422).json({ message: "O número da mesa e o ID do botão são obrigatórios." });
        }

        try {
            const mesaNumeroExists = await Mesa.findOne({ numero: numero, empresa: empresaId });
            if (mesaNumeroExists) {
                return res.status(409).json({ message: `O número de mesa '${numero}' já está em uso na sua empresa.` });
            }

            const botaoIdExists = await Mesa.findOne({ id_botao: id_botao });
            if (botaoIdExists) {
                return res.status(409).json({ message: "Este ID de botão já está associado a outra mesa." });
            }

            const novaMesa = new Mesa({
                numero,
                id_botao,
                empresa: empresaId
            });

            await novaMesa.save();

            res.status(201).json({ message: "Mesa criada com sucesso!", mesa: novaMesa });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar mesa.", error: error.message });
        }
    }

    static async getAllMesas(req, res) {
        const empresaId = req.user.empresa;

        try {
            const mesas = await Mesa.find({ empresa: empresaId, ativo: true }).sort('numero');
            res.status(200).json({ mesas });
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar mesas.", error: error.message });
        }
    }
    static async getMesaById(req, res) {
        const id = req.params.id;
        const empresaId = req.user.empresa;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID da mesa inválido." });
        }

        try {
            const mesa = await Mesa.findOne({ _id: id, empresa: empresaId });
            if (!mesa) {
                return res.status(404).json({ message: "Mesa não encontrada nesta empresa." });
            }
            res.status(200).json({ mesa });
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar mesa.", error: error.message });
        }
    }
    static async updateMesa(req, res) {
        const id = req.params.id;
        const empresaId = req.user.empresa;
        
        const updateData = {};
        const camposPermitidos = ['numero', 'id_botao'];

        for (const campo of camposPermitidos) {
            if (req.body[campo]) {
                updateData[campo] = req.body[campo];
            }
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(422).json({ message: "Nenhum dado para atualização foi fornecido." });
        }

        try {
            const mesaAtualizada = await Mesa.findOneAndUpdate(
                { _id: id, empresa: empresaId },
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!mesaAtualizada) {
                return res.status(404).json({ message: "Mesa não encontrada para atualização." });
            }

            res.status(200).json({ message: "Mesa atualizada com sucesso!", mesa: mesaAtualizada });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ message: "O número da mesa ou ID do botão informado já está em uso." });
            }
            res.status(500).json({ message: "Erro ao atualizar mesa.", error: error.message });
        }
    }
    static async deleteMesa(req, res) {
        const id = req.params.id;
        const empresaId = req.user.empresa;
        
        try {
            const mesaDesativada = await Mesa.findOneAndUpdate(
                { _id: id, empresa: empresaId },
                { ativo: false }
            );

            if (!mesaDesativada) {
                return res.status(404).json({ message: "Mesa não encontrada para desativar." });
            }

            res.status(200).json({ message: "Mesa desativada com sucesso." });
        } catch (error) {
            res.status(500).json({ message: "Erro ao desativar mesa.", error: error.message });
        }
    }
}