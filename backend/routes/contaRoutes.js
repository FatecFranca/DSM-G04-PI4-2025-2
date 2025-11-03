const express = require('express');
const router = express.Router();
const ContaController = require('../controllers/ContaController');
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

router.post('/', 
    isAuthenticated, 
    checkRole(['garcom', 'gerente']), 
    ContaController.abrirConta
);
router.get('/mesa/:mesaId/ativa', 
    isAuthenticated, 
    checkRole(['garcom', 'gerente']), 
    ContaController.getContaAtivaDaMesa
);
router.patch('/:id/cancelar', 
    isAuthenticated, 
    checkRole(['gerente']), 
    ContaController.cancelarConta
);
router.get('/',
    isAuthenticated,
    checkRole(['gerente']),
    ContaController.listarContas
);

module.exports = router;