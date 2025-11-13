const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gerenciamento de pedidos (Garçom, Cozinha)
 */

/**
 * @swagger
 * /pedidos/mesa/{mesaId}:
 *   post:
 *     summary: Cria um novo pedido para uma mesa (Garçom/Gerente)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mesaId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da mesa que está fazendo o pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item:
 *                       type: string
 *                       description: O _id do item no Cardápio
 *                       example: "69042c059b1e8a3c1c8e4f5f"
 *                     quantidade:
 *                       type: number
 *                       example: 2
 *                     observacao:
 *                       type: string
 *                       example: "Sem cebola"
 *               observacoes_gerais:
 *                 type: string
 *                 example: "Alergia a amendoim"
 *     responses:
 *       '201':
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       '401':
 *         description: Acesso negado (token)
 *       '404':
 *         description: Mesa ou item do cardápio não encontrado
 *       '422':
 *         description: Pedido não pode estar vazio
 */
router.post(
  '/mesa/:mesaId',
  isAuthenticated,
  checkRole(['garcom', 'gerente']),
  PedidoController.criarPedido
);

/**
 * @swagger
 * /pedidos/{id}/entregue:
 *   patch:
 *     summary: Garçom marca um pedido como 'entregue'
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do pedido
 *     responses:
 *       '200':
 *         description: Pedido marcado como 'entregue'
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Pedido não encontrado
 *       '409':
 *         description: Este pedido ainda não estava 'pronto'
 */
router.patch(
  '/:id/entregue',
  isAuthenticated,
  checkRole(['garcom', 'gerente']),
  PedidoController.marcarComoEntregue
);

/**
 * @swagger
 * /pedidos/{id}/preparar:
 *   patch:
 *     summary: Cozinha marca um pedido como 'preparando'
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do pedido
 *     responses:
 *       '200':
 *         description: Preparo iniciado
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Pedido não encontrado
 *       '409':
 *         description: Este pedido já está sendo preparado
 */
router.patch(
  '/:id/preparar',
  isAuthenticated,
  checkRole(['cozinheiro', 'gerente']),
  PedidoController.iniciarPreparo
);

/**
 * @swagger
 * /pedidos/{id}/pronto:
 *   patch:
 *     summary: Cozinha marca um pedido como 'pronto'
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do pedido
 *     responses:
 *       '200':
 *         description: Pedido pronto para entrega
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Pedido não encontrado
 *       '409':
 *         description: Este pedido não estava em 'preparando'
 */
router.patch(
  '/:id/pronto',
  isAuthenticated,
  checkRole(['cozinheiro', 'gerente']),
  PedidoController.marcarComoPronto
);

/**
 * @swagger
 * /pedidos/cozinha:
 *   get:
 *     summary: Lista pedidos para a cozinha (status 'enviado_cozinha' ou 'preparando')
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de pedidos para a cozinha
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       '401':
 *         description: Acesso negado
 */
router.get(
  '/cozinha',
  isAuthenticated,
  checkRole(['cozinheiro', 'gerente']),
  PedidoController.listarPedidosCozinha
);

/**
 * @swagger
 * /pedidos/garcom/prontos:
 *   get:
 *     summary: Lista pedidos 'prontos' (para o garçom logado)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de pedidos prontos para entrega
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       '401':
 *         description: Acesso negado
 */
router.get(
  '/garcom/prontos',
  isAuthenticated,
  checkRole(['garcom', 'gerente']),
  PedidoController.listarPedidosProntosGarcom
);

module.exports = router;
