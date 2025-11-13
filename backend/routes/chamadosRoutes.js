const express = require('express');
const router = express.Router();
const ChamadoController = require('../controllers/ChamadoController');

const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

/**
 * @swagger
 * tags:
 *   name: Chamados
 *   description: "API para gerenciamento de chamados (botão da mesa)"
 */

/**
 * @swagger
 * /chamados:
 *   post:
 *     summary: "Cria um novo chamado (acionado pelo botão da mesa)"
 *     tags: [Chamados]
 *     security: []  # Esta rota é pública, pois o botão (hardware) não tem token de login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_botao:
 *                 type: string
 *                 description: "O ID de hardware único do botão da mesa"
 *                 example: "BTN_MESA_10"
 *     responses:
 *       '201':
 *         description: "Chamado criado com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chamado'
 *       '404':
 *         description: "Botão não cadastrado / Mesa não encontrada"
 *       '409':
 *         description: "Esta mesa já possui um chamado pendente"
 *       '422':
 *         description: "O ID do botão é obrigatório"
 */
router.post('/', ChamadoController.criarChamado);

/**
 * @swagger
 * /chamados/pendentes:
 *   get:
 *     summary: "Lista todos os chamados pendentes"
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []  # Rota protegida
 *     responses:
 *       '200':
 *         description: "Lista de chamados pendentes"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chamado'
 *       '401':
 *         description: "Acesso negado (token inválido ou expirado)"
 */
router.get('/pendentes', isAuthenticated, checkRole(['garcom', 'gerente']), ChamadoController.listarPendentes);

/**
 * @swagger
 * /chamados/{id}/aceitar:
 *   patch:
 *     summary: "Garçom aceita um chamado pendente"
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID do chamado"
 *     responses:
 *       '200':
 *         description: "Chamado aceito com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chamado'
 *       '404':
 *         description: "Chamado não encontrado"
 *       '409':
 *         description: "Este chamado já foi atendido"
 */
router.patch('/:id/aceitar', isAuthenticated, checkRole(['garcom', 'gerente']), ChamadoController.aceitarChamado);

/**
 * @swagger
 * /chamados/{id}/resolver:
 *   patch:
 *     summary: "Garçom resolve/fecha um chamado (ex: cliente só tinha uma dúvida)"
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID do chamado"
 *     responses:
 *       '200':
 *         description: "Atendimento finalizado com sucesso"
 *       '404':
 *         description: "Chamado não encontrado ou não pertence a este garçom"
 */
router.patch('/:id/resolver', isAuthenticated, checkRole(['garcom', 'gerente']), ChamadoController.resolverChamado);

module.exports = router;
