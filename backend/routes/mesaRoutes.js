const express = require('express');
const router = express.Router();
const MesaController = require('../controllers/MesaController');
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

/**
 * @swagger
 * tags:
 *   name: Mesas
 *   description: Gerenciamento das mesas e botões do estabelecimento
 */

/**
 * @swagger
 * /mesas:
 *   post:
 *     summary: Cadastra uma nova mesa (somente Gerente)
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: number
 *                 example: 12
 *               id_botao:
 *                 type: string
 *                 example: "BTN_HW_12"
 *     responses:
 *       '201':
 *         description: Mesa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mesa'
 *       '401':
 *         description: Acesso negado (token)
 *       '403':
 *         description: Acesso negado (não é gerente)
 *       '409':
 *         description: Conflito (número da mesa ou ID do botão já existem)
 *       '422':
 *         description: Dados inválidos
 */
router.post('/', isAuthenticated, checkRole(['gerente']), MesaController.createMesa);

/**
 * @swagger
 * /mesas/{id}:
 *   patch:
 *     summary: Atualiza o número ou ID do botão de uma mesa (somente Gerente)
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da mesa a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: number
 *                 example: 13
 *               id_botao:
 *                 type: string
 *                 example: "BTN_HW_13_NOVO"
 *     responses:
 *       '200':
 *         description: Mesa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mesa'
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Mesa não encontrada
 */
router.patch('/:id', isAuthenticated, checkRole(['gerente']), MesaController.updateMesa);

/**
 * @swagger
 * /mesas/{id}:
 *   delete:
 *     summary: Desativa (soft delete) uma mesa (somente Gerente)
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da mesa a ser desativada
 *     responses:
 *       '200':
 *         description: Mesa desativada com sucesso
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Mesa não encontrada
 */
router.delete('/:id', isAuthenticated, checkRole(['gerente']), MesaController.deleteMesa);

/**
 * @swagger
 * /mesas:
 *   get:
 *     summary: Lista todas as mesas da empresa (para Garçom, Gerente, Cozinha)
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sucesso. Retorna um objeto com a chave 'mesas'.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mesas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mesa'
 *       '401':
 *         description: Acesso negado
 */
router.get('/', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), MesaController.getAllMesas);

/**
 * @swagger
 * /mesas/{id}:
 *   get:
 *     summary: Busca uma mesa específica por ID
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da mesa
 *     responses:
 *       '200':
 *         description: Mesa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mesa'
 *       '401':
 *         description: Acesso negado
 *       '404':
 *         description: Mesa não encontrada
 */
router.get('/:id', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), MesaController.getMesaById);

module.exports = router;
