const express = require('express');
const router = express.Router();
const CardapioItemController = require('../controllers/CardapioItemController');

// Middlewares de Segurança
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

// --- ROTAS DE GERENTE (Modificação do Cardápio) ---
// Criar um novo item
router.post('/', isAuthenticated, checkRole(['gerente']), CardapioItemController.createItem);

// Atualizar um item existente
router.patch('/:id', isAuthenticated, checkRole(['gerente']), CardapioItemController.updateItem);

// Desativar (Soft Delete) um item
router.delete('/:id', isAuthenticated, checkRole(['gerente']), CardapioItemController.deleteItem);


// --- ROTAS PARA TODOS OS FUNCIONÁRIOS (Consulta do Cardápio) ---
// Listar todos os itens (garçons veem apenas os disponíveis, gerentes veem todos)
router.get('/', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), CardapioItemController.getAllItems);

// Ver detalhes de um item específico
router.get('/:id', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), CardapioItemController.getItemById);

module.exports = router;