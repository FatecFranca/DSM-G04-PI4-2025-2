const express = require('express');
const router = express.Router();
const ContaController = require('../controllers/ContaController');
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

/**
 * @swagger
 * tags:
 *   name: Contas
 *   description: Gerenciamento das contas das mesas (abrir, fechar, listar)
 */

/**
 * @swagger
 * /contas:
 *   post:
 *     summary: Abre uma nova conta para uma mesa (Garçom/Gerente)
 *     tags: [Contas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mesaId:
 *                 type: string
 *                 description: O _id da mesa que está abrindo a conta
 *                 example: "690420c46bcd67bbb0d6c403"
 *     responses:
 *       '201':
 *         description: Conta aberta com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conta'
 *       '401':
 *         description: Acesso negado (token)
 *       '404':
 *         description: Mesa não encontrada
 *       '409':
 *         description: A mesa selecionada já está ocupada
 */
router.post(
  '/',
  isAuthenticated,
  checkRole(['garcom', 'gerente']),
  ContaController.abrirConta
);

/**
 * @swagger
 * /contas/mesa/{mesaId}/ativa:
 *   get:
 *     summary: Busca a conta ativa de uma mesa específica (Garçom/Gerente)
 *     tags: [Contas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mesaId
 *         required: true
 *         schema:
 *           type: string
 *         description: O _id da mesa
 *     responses:
 *       '200':
 *         description: Conta ativa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conta:
 *                   $ref: '#/components/schemas/Conta'
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Nenhuma conta ativa encontrada para esta mesa
 */
router.get(
  '/mesa/:mesaId/ativa',
  isAuthenticated,
  checkRole(['garcom', 'gerente']),
  ContaController.getContaAtivaDaMesa
);

/**
 * @swagger
 * /contas/{id}/cancelar:
 *   patch:
 *     summary: Cancela uma conta (Gerente)
 *     description: Só pode cancelar se o valor_total e valor_pago forem 0.
 *     tags: [Contas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O _id da conta a ser cancelada
 *     responses:
 *       '200':
 *         description: Conta cancelada com sucesso
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Conta não encontrada
 *       '409':
 *         description: Não é possível cancelar (conta já fechada ou com pagamentos/pedidos)
 */
router.patch(
  '/:id/cancelar',
  isAuthenticated,
  checkRole(['gerente', 'garcom']),
  ContaController.cancelarConta
);

/**
 * @swagger
 * /contas:
 *   get:
 *     summary: Lista o histórico de contas (Gerente)
 *     description: Retorna uma lista de contas, com filtros opcionais por status ou data.
 *     tags: [Contas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberta, fechada, cancelada]
 *         description: Filtrar contas por status
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       '200':
 *         description: Lista de contas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conta'
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Nenhuma conta encontrada com esses filtros
 */
router.get(
  '/',
  isAuthenticated,
  checkRole(['gerente']),
  ContaController.listarContas
);

module.exports = router;
