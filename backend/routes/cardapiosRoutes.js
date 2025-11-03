const express = require('express');
const router = express.Router();
const CardapioController = require('../controllers/CardapioController');

const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

router.post('/', isAuthenticated, checkRole(['gerente']), CardapioController.createItem);

router.patch('/:id', isAuthenticated, checkRole(['gerente']), CardapioController.updateItem);

router.delete('/:id', isAuthenticated, checkRole(['gerente']), CardapioController.deleteItem);


router.get('/', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), CardapioController.getAllItems);

router.get('/:id', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), CardapioController.getItemById);

module.exports = router;