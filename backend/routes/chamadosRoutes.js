const express = require('express');
const router = express.Router();
const ChamadoController = require('../controllers/ChamadoController');

const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

router.post('/', ChamadoController.criarChamado);

router.get('/pendentes', isAuthenticated, checkRole(['garcom', 'gerente']), ChamadoController.listarPendentes);

router.patch('/:id/aceitar', isAuthenticated, checkRole(['garcom']), ChamadoController.aceitarChamado);

router.patch('/:id/resolver', isAuthenticated, checkRole(['garcom']), ChamadoController.resolverChamado);

module.exports = router;