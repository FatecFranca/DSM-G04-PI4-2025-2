const router = require("express").Router();
const UserController = require("../controllers/UserControllers");
const checkRole = require("../helpers/checkRole");
const isAuthenticated = require("../helpers/isAuthenticated");

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Login e gerenciamento de tokens (Refresh/Logout estão em /auth)
 *   - name: Usuários
 *     description: Gerenciamento de funcionários (CRUD de usuários)
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Realiza o login do usuário (Gerente ou Funcionário)
 *     tags: [Autenticação]
 *     security: [] # Rota pública
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "gerente@email.com"
 *               credencial:
 *                 type: string
 *                 description: A 'senha' (se for gerente) ou o 'pin' (se for funcionário)
 *                 example: "123456"
 *     responses:
 *       '200':
 *         description: Login bem-sucedido. Retorna os tokens e o usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         description: Usuário não encontrado
 *       '403':
 *         description: Usuário inativo
 *       '422':
 *         description: Credencial inválida
 */
router.post("/login", UserController.login);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Cadastra um novo funcionário (somente Gerente)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Novo Garçom"
 *               email:
 *                 type: string
 *                 example: "garcom@email.com"
 *               cpf:
 *                 type: string
 *                 example: "12345678900"
 *               cargo:
 *                 type: string
 *                 enum: [garcom, cozinheiro]
 *                 example: "garcom"
 *     responses:
 *       '200':
 *         description: Funcionário criado com sucesso
 *       '401':
 *         description: Acesso negado (token)
 *       '403':
 *         description: Acesso negado (não é gerente)
 *       '409':
 *         description: CPF ou e-mail já cadastrado
 */
router.post(
  "/register",
  isAuthenticated,
  checkRole(["gerente"]),
  UserController.addFuncionario
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um funcionário específico por ID (somente Gerente)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O _id do funcionário
 *     responses:
 *       '200':
 *         description: Funcionário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 funcionario:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         description: Funcionário não encontrado
 */
router.get('/:id', isAuthenticated, checkRole(['gerente']), UserController.getFuncionario);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os funcionários (somente Gerente)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de funcionários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 funcionarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', isAuthenticated, checkRole(['gerente']), UserController.getAllFuncionarios);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Atualiza os dados de um funcionário (somente Gerente)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O _id do funcionário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               cargo:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Funcionário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: Funcionário não encontrado
 *       '409':
 *         description: E-mail já está em uso
 */
router.patch('/:id', isAuthenticated, checkRole(['gerente']), UserController.updateFuncionario);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Desativa um funcionário (soft delete) (somente Gerente)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O _id do funcionário a ser desativado
 *     responses:
 *       '200':
 *         description: Funcionário desativado
 *       '403':
 *         description: Gerente não pode desativar a si mesmo
 *       '404':
 *         description: Funcionário não encontrado
 */
router.delete('/:id', isAuthenticated, checkRole(['gerente']), UserController.deleteFuncionario);

module.exports = router;
