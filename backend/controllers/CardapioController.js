const CardapioItem = require('../models/CardapioItem');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class CardapioItemController {
    static async createItem(req, res) {
        const { nome, descricao, preco, categoria } = req.body;
        const empresaId = req.user.empresa;

        if (!nome) return res.status(422).json({ message: "O nome do item é obrigatório." });
        if (!preco) return res.status(422).json({ message: "O preço do item é obrigatório." });
        if (!categoria) return res.status(422).json({ message: "A categoria do item é obrigatória." });

        try {
            const itemExists = await CardapioItem.findOne({ nome: nome, empresa: empresaId });
            if (itemExists) {
                return res.status(409).json({ message: "Um item com este nome já existe no seu cardápio." });
            }

            const novoItem = new CardapioItem({
                nome,
                descricao,
                preco,
                categoria,
                empresa: empresaId
            });

            await novoItem.save();

            res.status(201).json({ message: "Item criado com sucesso!", item: novoItem });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar item.", error: error.message });
        }
    }
    static async getAllItems(req, res) {
        const empresaId = req.user.empresa;
        const cargo = req.user.cargo;

        try {
            const query = { empresa: empresaId };
            if (cargo !== 'gerente') {
                query.disponivel = true;
            }

            const itens = await CardapioItem.find(query).sort('categoria nome');
            res.status(200).json({ itens });
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar cardápio.", error: error.message });
        }
    }
    static async getItemById(req, res) {
        const id = req.params.id;
        const empresaId = req.user.empresa;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID do item inválido." });
        }

        try {
            const item = await CardapioItem.findOne({ _id: id, empresa: empresaId });
            if (!item) {
                return res.status(404).json({ message: "Item não encontrado nesta empresa." });
            }
            res.status(200).json({ item });
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar item.", error: error.message });
        }
    }
    static async updateItem(req, res) {
        const id = req.params.id;
        const empresaId = req.user.empresa;
        
        const updateData = {};
        const camposPermitidos = ['nome', 'descricao', 'preco', 'categoria', 'disponivel'];

        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) {
                updateData[campo] = req.body[campo];
            }
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(422).json({ message: "Nenhum dado para atualização foi fornecido." });
        }

        try {
            const itemAtualizado = await CardapioItem.findOneAndUpdate(
                { _id: id, empresa: empresaId },
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!itemAtualizado) {
                return res.status(404).json({ message: "Item não encontrado para atualização." });
            }

            res.status(200).json({ message: "Item atualizado com sucesso!", item: itemAtualizado });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ message: "Um item com este nome já existe no seu cardápio." });
            }
            res.status(500).json({ message: "Erro ao atualizar item.", error: error.message });
        }
    }

    static async deleteItem(req, res) {
        const id = req.params.id;
        const empresaId = req.user.empresa;
        
        try {
            const itemDesativado = await CardapioItem.findOneAndUpdate(
                { _id: id, empresa: empresaId },
                { disponivel: false }
            );

            if (!itemDesativado) {
                return res.status(404).json({ message: "Item não encontrado para desativar." });
            }

            res.status(200).json({ message: "Item desativado com sucesso." });
        } catch (error) {
            res.status(500).json({ message: "Erro ao desativar item.", error: error.message });
        }
    }
}