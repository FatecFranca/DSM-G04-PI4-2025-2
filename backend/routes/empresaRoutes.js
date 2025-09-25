const express = require('express');
const router = express.Router();
const EmpresaController = require('../controllers/EmpresaController');
const isAuthenticated = require('../helpers/IsAuthenticated')
const checkRole = require('../helpers/checkRole')

router.post('/register', EmpresaController.register);
router.get('/me', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), EmpresaController.getEmpresa)
router.patch('/me', isAuthenticated, checkRole(['gerente']), EmpresaController.updateEmpresa)
router.delete('/me', isAuthenticated, checkRole(['gerente']), EmpresaController.deleteEmpresa)

module.exports = router;