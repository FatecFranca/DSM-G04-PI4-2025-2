const express = require('express');
const router = express.Router();
const MesaController = require('../controllers/MesaController');

const isAuthenticated = require('../helpers/IsAuthenticated');
const checkRole = require('../helpers/checkRole');


router.post('/', isAuthenticated, checkRole(['gerente']), MesaController.createMesa);

router.patch('/:id', isAuthenticated, checkRole(['gerente']), MesaController.updateMesa);

router.delete('/:id', isAuthenticated, checkRole(['gerente']), MesaController.deleteMesa);

router.get('/', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), MesaController.getAllMesas);

router.get('/:id', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), MesaController.getMesaById);

module.exports = router;