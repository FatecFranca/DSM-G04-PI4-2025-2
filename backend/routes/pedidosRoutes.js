const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

router.get('/', 
    isAuthenticated, 
    checkRole(['gerente']), 
    PedidoController.listarPedidos
);

router.post('/mesa/:mesaId', 
    isAuthenticated, 
    checkRole(['garcom', 'gerente']), 
    PedidoController.criarPedido
);

router.patch('/:id/entregue', 
    isAuthenticated, 
    checkRole(['garcom', 'gerente']), 
    PedidoController.marcarComoEntregue
);
router.patch('/:id/preparar', 
    isAuthenticated, 
    checkRole(['cozinheiro', 'gerente']), 
    PedidoController.iniciarPreparo
);

router.patch('/:id/pronto', 
    isAuthenticated, 
    checkRole(['cozinheiro', 'gerente']), 
    PedidoController.marcarComoPronto
);
router.get('/cozinha', 
    isAuthenticated, 
    checkRole(['cozinheiro', 'gerente']), 
    PedidoController.listarPedidosCozinha
);
router.get('/garcom/prontos', 
    isAuthenticated, 
    checkRole(['garcom', 'gerente']), 
    PedidoController.listarPedidosProntosGarcom
);

module.exports = router;