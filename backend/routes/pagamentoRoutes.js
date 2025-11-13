const express = require('express');
const router = express.Router();
const PagamentoController = require('../controllers/PagamentoController');
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

/**
 * @swagger
 * tags:
 *   - name: Pagamentos
 *     description: "Rotas para registrar e consultar pagamentos em uma conta"
 */

/**
 * @swagger
 * /pagamentos:
 *   post:
 *     summary: "Registra um novo pagamento (parcial ou total) em uma conta"
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contaId:
 *                 type: string
 *                 description: "O _id da Conta que está sendo paga"
 *                 example: "69115a3c23b718a4bc86fa88"
 *               valor:
 *                 type: number
 *                 description: "O valor a ser pago"
 *                 example: 50.00
 *               metodo:
 *                 type: string
 *                 description: "Método de pagamento utilizado"
 *                 enum: [dinheiro, cartao_credito, cartao_debito, pix]
 *                 example: "pix"
 *     responses:
 *       '201':
 *         description: "Pagamento registrado com sucesso. Retorna a conta atualizada."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conta'
 *       '401':
 *         description: "Acesso negado (token inválido)"
 *       '404':
 *         description: "Conta não encontrada"
 *       '409':
 *         description: "A conta não está aberta para pagamentos"
 *       '422':
 *         description: "Dados inválidos (exemplo: valor menor ou igual a 0)"
 */
router.post(
  '/',
  isAuthenticated,
  checkRole(['garcom', 'gerente']),
  PagamentoController.adicionarPagamento
);

/**
 * @swagger
 * /pagamentos/conta/{contaId}:
 *   get:
 *     summary: "Lista todos os pagamentos feitos para uma conta específica"
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contaId
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID da conta para buscar os pagamentos"
 *     responses:
 *       '200':
 *         description: "Lista de pagamentos da conta"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagamentos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pagamento'
 *       '401':
 *         description: "Acesso negado (token inválido)"
 *       '422':
 *         description: "ID da conta inválido"
 */
router.get(
  '/conta/:contaId',
  isAuthenticated,
  checkRole(['garcom', 'gerente']),
  PagamentoController.listarPagamentosDaConta
);

module.exports = router;
