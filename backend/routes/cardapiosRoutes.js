const express = require('express');
const router = express.Router();
const CardapioController = require('../controllers/CardapioController');

const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

/**
 * @swagger
 * tags:
 *   name: Cardápio
 *   description: Gerenciamento dos itens do cardápio
 */

/**
 * @swagger
 * /cardapios:
 *   post:
 *     summary: Cria um novo item no cardápio
 *     tags: [Cardápio]
 *     security:
 *       - bearerAuth: []  # Rota protegida (só gerente)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "X-Burger Especial"
 *               descricao:
 *                 type: string
 *                 example: "Pão, bife 180g, queijo, bacon e molho da casa"
 *               preco:
 *                 type: number
 *                 example: 32.50
 *               categoria:
 *                 type: string
 *                 enum: [bebida, prato_principal, sobremesa, entrada]
 *                 example: "prato_principal"
 *     responses:
 *       '201':
 *         description: "Item criado com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cardapio'
 *       '401':
 *         description: "Acesso negado (token inválido)"
 *       '403':
 *         description: "Acesso negado (não é gerente)"
 *       '422':
 *         description: "Dados inválidos (ex: nome ou preço faltando)"
 */
router.post('/', isAuthenticated, checkRole(['gerente']), CardapioController.createItem);

/**
 * @swagger
 * /cardapios/{id}:
 *   patch:
 *     summary: Atualiza um item existente no cardápio
 *     tags: [Cardápio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID do item de cardápio"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               categoria:
 *                 type: string
 *               disponivel:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: "Item atualizado com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cardapio'
 *       '401':
 *         description: "Acesso negado"
 *       '404':
 *         description: "Item não encontrado"
 */
router.patch('/:id', isAuthenticated, checkRole(['gerente']), CardapioController.updateItem);

/**
 * @swagger
 * /cardapios/{id}:
 *   delete:
 *     summary: Remove (desativa) um item do cardápio
 *     tags: [Cardápio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID do item de cardápio"
 *     responses:
 *       '200':
 *         description: "Item removido com sucesso"
 *       '401':
 *         description: "Acesso negado"
 *       '404':
 *         description: "Item não encontrado"
 */
router.delete('/:id', isAuthenticated, checkRole(['gerente']), CardapioController.deleteItem);

/**
 * @swagger
 * /cardapios:
 *   get:
 *     summary: Lista todos os itens do cardápio (Rota pública)
 *     tags: [Cardápio]
 *     security: []  # Rota pública, remove o cadeado
 *     responses:
 *       '200':
 *         description: "Lista de itens do cardápio"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cardapio'
 */
router.get('/', isAuthenticated, CardapioController.getAllItems);

/**
 * @swagger
 * /cardapios/{id}:
 *   get:
 *     summary: Busca um item específico do cardápio por ID
 *     tags: [Cardápio]
 *     security:
 *       - bearerAuth: []  # Rota protegida
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID do item de cardápio"
 *     responses:
 *       '200':
 *         description: "Item encontrado"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cardapio'
 *       '401':
 *         description: "Acesso negado"
 *       '404':
 *         description: "Item não encontrado"
 */
router.get('/:id', isAuthenticated, checkRole(['gerente', 'garcom', 'cozinheiro']), CardapioController.getItemById);

module.exports = router;
