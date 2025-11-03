const express = require('express');
const router = express.Router();
const PagamentoController = require('../controllers/PagamentoController');

const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

router.post('/', 
    isAuthenticated, 
    checkRole(['garcom', 'gerente']), 
    PagamentoController.adicionarPagamento
);

router.get('/conta/:contaId', 
    isAuthenticated, 
    checkRole(['garcom', 'gerente']), 
    PagamentoController.listarPagamentosDaConta
);

module.exports = router;