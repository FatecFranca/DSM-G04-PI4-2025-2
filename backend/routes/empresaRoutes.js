const express = require('express');
const router = express.Router();
const EmpresaController = require('../controllers/EmpresaController');
const isAuthenticated = require('../helpers/isAuthenticated');
const checkRole = require('../helpers/checkRole');

/**
 * @swagger
 * tags:
 *   - name: Empresa
 *     description: "Gerenciamento da empresa (cadastro inicial e dados da empresa logada)"
 */

/**
 * @swagger
 * /empresas/register:
 *   post:
 *     summary: "Registra uma nova empresa e o usuário Gerente"
 *     description: "Cria a empresa e o primeiro usuário com o cargo de Gerente. Retorna os tokens de autenticação."
 *     tags: [Empresa]
 *     security: []  # Rota pública, sem necessidade de token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomeCompleto
 *               - email
 *               - cpf
 *               - senha
 *               - confirmarSenha
 *               - nomeEmpresa
 *               - tipo
 *               - cnpj
 *             properties:
 *               nomeCompleto:
 *                 type: string
 *                 description: "Nome completo do gerente responsável pela empresa"
 *                 example: "Paulo Silva"
 *               email:
 *                 type: string
 *                 description: "E-mail do gerente (usado para login)"
 *                 example: "paulo@restaurante.com"
 *               cpf:
 *                 type: string
 *                 description: "CPF do gerente (somente números)"
 *                 example: "12345678900"
 *               senha:
 *                 type: string
 *                 description: "Senha de acesso do gerente"
 *                 example: "senha123"
 *               confirmarSenha:
 *                 type: string
 *                 description: "Confirmação da senha do gerente"
 *                 example: "senha123"
 *               nomeEmpresa:
 *                 type: string
 *                 description: "Nome fantasia da empresa"
 *                 example: "Restaurante do Paulo"
 *               tipo:
 *                 type: string
 *                 description: "Tipo de estabelecimento"
 *                 enum: [Restaurante, Bar, Cafeteria, Outro]
 *                 example: "Restaurante"
 *               cnpj:
 *                 type: string
 *                 description: "CNPJ da empresa (somente números)"
 *                 example: "12345678000199"
 *     responses:
 *       '201':
 *         description: "Empresa e Gerente criados com sucesso. Retorna os tokens de login."
 *       '409':
 *         description: "Conflito — CNPJ ou e-mail já estão cadastrados."
 *       '422':
 *         description: "Erro de validação — dados ausentes ou inválidos."
 *       '500':
 *         description: "Erro interno no servidor."
 */

router.post('/register', EmpresaController.register);

/**
 * @swagger
 * /empresas/me:
 *   get:
 *     summary: "Busca os dados da empresa do usuário logado"
 *     description: "Retorna os dados da empresa vinculada ao token do usuário (qualquer cargo)."
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []  # Rota protegida, precisa de token
 *     responses:
 *       '200':
 *         description: "Dados da empresa"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 empresa:
 *                   $ref: '#/components/schemas/Empresa'
 *       '401':
 *         description: "Acesso negado (token inválido ou expirado)"
 *       '404':
 *         description: "Empresa não encontrada"
 */
router.get(
  '/me',
  isAuthenticated,
  checkRole(['gerente', 'garcom', 'cozinheiro']),
  EmpresaController.getEmpresa
);

/**
 * @swagger
 * /empresas/me:
 *   patch:
 *     summary: "Atualiza os dados da empresa (somente Gerente)"
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeEmpresa:
 *                 type: string
 *                 example: "Restaurante Novo Nome"
 *               tipo:
 *                 type: string
 *                 enum: [Restaurante, Bar, Cafeteria, Outro]
 *     responses:
 *       '200':
 *         description: "Empresa atualizada com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       '401':
 *         description: "Acesso negado (token)"
 *       '403':
 *         description: "Acesso negado (não é gerente)"
 *       '404':
 *         description: "Empresa não encontrada"
 */
router.patch(
  '/me',
  isAuthenticated,
  checkRole(['gerente']),
  EmpresaController.updateEmpresa
);

/**
 * @swagger
 * /empresas/me:
 *   delete:
 *     summary: "Desativa a empresa (somente Gerente)"
 *     description: "Marca a empresa como 'ativo: false'."
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Empresa desativada com sucesso"
 *       '401':
 *         description: "Acesso negado (token)"
 *       '403':
 *         description: "Acesso negado (não é gerente)"
 *       '404':
 *         description: "Empresa não encontrada"
 */
router.delete(
  '/me',
  isAuthenticated,
  checkRole(['gerente']),
  EmpresaController.deleteEmpresa
);

module.exports = router;
