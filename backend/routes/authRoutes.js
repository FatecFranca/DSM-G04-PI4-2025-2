const router = require("express").Router();
const AuthController = require("../controllers/AuthController");

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas para login, refresh e logout (o 'login' está em /users/login)
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renova um Access Token expirado
 *     description: Recebe um Refresh Token (longo) válido e retorna um novo Access Token (curto).
 *     tags: [Autenticação]
 *     security: []  # Esta rota é pública, não precisa de token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: O Refresh Token (longo) obtido no login
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDQyMDMzNmJjZDY3YmJiMGQ2YzNmMSIsImNhcmdvIjoiZ2VyZW50ZSIsImVtcHJlc2EiOiI2OTA0MjAzMzZiY2Q2N2JiYjBkNmMzZjEiLCJpYXQiOjE3MzEyMzQ1NjcsImV4cCI6MTczMTg0OTM2N30.abcdef123..."
 *     responses:
 *       '200':
 *         description: Novo Access Token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDQyMDMzNmJjZDY3YmJiMGQ2YzNmMSIsImNhcmdvIjoiZ2VyZW50ZSIsImVtcHJlc2EiOiI2OTA0MjAzMzZiY2Q2N2JiYjBkNmMzZjEiLCJpYXQiOjE3MzEyMzU0NjgsImV4cCI6MTczMTIzNjM2OH0.xyz789..."
 *       '403':
 *         description: Refresh token inválido ou expirado
 *       '422':
 *         description: Refresh token não fornecido
 */
router.post("/refresh", AuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Invalida um Refresh Token (Logout)
 *     description: Remove o Refresh Token do banco de dados, impedindo que ele seja usado para renovar tokens futuros.
 *     tags: [Autenticação]
 *     security: []  # Rota pública
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: O Refresh Token (longo) que será invalidado
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDQyMDMzNmJjZDY3YmJiMGQ2YzNmMSIsImNhcmdvIjoiZ2VyZW50ZSIsImVtcHJlc2EiOiI2OTA0MjAzMzZiY2Q2N2JiYjBkNmMzZjEiLCJpYXQiOjE3MzEyMzQ1NjcsImV4cCI6MTczMTg0OTM2N30.abcdef123..."
 *     responses:
 *       '200':
 *         description: Logout bem-sucedido
 *       '500':
 *         description: Erro ao fazer logout
 */
router.post("/logout", AuthController.logout);

module.exports = router;
