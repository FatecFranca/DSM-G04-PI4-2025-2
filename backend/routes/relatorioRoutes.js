const router = require("express").Router();
const RelatorioController = require("../controllers/RelatorioController");
const isAuthenticated = require("../helpers/isAuthenticated");
const checkRole = require("../helpers/checkRole");

/**
 * @swagger
 * tags:
 *   - name: Relatórios
 *     description: Endpoints analíticos para dashboards (Gerente e Garçom)
 */


/**
 * @swagger
 * /relatorios/kpis:
 *   get:
 *     summary: "(Gerente) Retorna os KPIs principais da empresa (Cards)"
 *     description: "Retorna Faturamento Total, Ticket Médio, Desvio Padrão, Nº de Contas e o Intervalo de Confiança."
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filtro de data inicial (YYYY-MM-DD)"
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filtro de data final (YYYY-MM-DD)"
 *     responses:
 *       '200':
 *         description: "Sucesso. Retorna o objeto de KPIs."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 faturamentoTotal:
 *                   type: number
 *                   example: 25000.50
 *                 totalContas:
 *                   type: integer
 *                   example: 120
 *                 ticketMedio:
 *                   type: number
 *                   example: 208.34
 *                 desvioPadrao:
 *                   type: number
 *                   example: 45.12
 *                 intervaloConfiancaTicketMedio:
 *                   type: object
 *                   properties:
 *                     nivelConfianca:
 *                       type: string
 *                       example: "95%"
 *                     media:
 *                       type: string
 *                       example: "208.34"
 *                     margemDeErro:
 *                       type: string
 *                       example: "8.10"
 *                     limiteInferior:
 *                       type: string
 *                       example: "200.24"
 *                     limiteSuperior:
 *                       type: string
 *                       example: "216.44"
 *       '401':
 *         description: "Acesso negado (Token inválido)"
 *       '403':
 *         description: "Acesso negado (Cargo não é gerente)"
 */
router.get("/kpis", isAuthenticated, checkRole(["gerente"]), RelatorioController.getKPIs);


/**
 * @swagger
 * /relatorios/previsao-vendas:
 *   get:
 *     summary: "(Gerente) Retorna dados históricos + previsão de faturamento (Linha)"
 *     description: "Usa Correlação e Regressão Linear para prever faturamento futuro."
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filtro de data inicial (YYYY-MM-DD)"
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filtro de data final (YYYY-MM-DD)"
 *     responses:
 *       '200':
 *         description: "Sucesso. Retorna dados da regressão."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chartData:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["2025-11-01", "2025-11-02"]
 *                     data:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [1200.50, 1350.00]
 *                 estatisticas:
 *                   type: object
 *                   properties:
 *                     correlacao_r:
 *                       type: number
 *                       example: 0.8950
 *                     R_squared:
 *                       type: number
 *                       example: 0.8010
 *                     equacao:
 *                       type: string
 *                       example: "Y = 149.50X + 1051.00"
 *                 previsao:
 *                   type: object
 *                   properties:
 *                     proximoPeriodoLabel:
 *                       type: string
 *                       example: "Dia 3"
 *                     faturamentoPrevisto:
 *                       type: number
 *                       example: 1500.00
 *       '401':
 *         description: "Acesso negado"
 *       '404':
 *         description: "Dados insuficientes"
 */
router.get("/previsao-vendas", isAuthenticated, checkRole(["gerente"]), RelatorioController.getPrevisaoVendas);


/**
 * @swagger
 * /relatorios/itens-mais-vendidos:
 *   get:
 *     summary: "(Gerente) Retorna os 5 itens mais vendidos (Barras)"
 *     description: "Não aceita filtro de data — consulta histórica."
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Sucesso. Retorna array de itens."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nomeItem:
 *                     type: string
 *                     example: "X-Burger Especial"
 *                   quantidadeVendida:
 *                     type: integer
 *                     example: 150
 *       '401':
 *         description: "Acesso negado"
 */
router.get("/itens-mais-vendidos", isAuthenticated, checkRole(["gerente"]), RelatorioController.getItensMaisVendidos);


/**
 * @swagger
 * /relatorios/estatisticas-vendas:
 *   get:
 *     summary: "(Gerente) Estatísticas de distribuição das vendas (Cards)"
 *     description: "Retorna Mediana, Moda e Assimetria."
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filtro de data inicial"
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filtro de data final"
 *     responses:
 *       '200':
 *         description: "Sucesso. Retorna estatísticas."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalValores:
 *                   type: integer
 *                   example: 120
 *                 mediana:
 *                   type: number
 *                   example: 190.00
 *                 moda:
 *                   type: string
 *                   example: "Nenhuma moda encontrada"
 *                 assimetria:
 *                   type: number
 *                   example: -0.153
 *                 valoresBrutos:
 *                   type: array
 *                   items:
 *                     type: number
 *       '401':
 *         description: "Acesso negado"
 *       '404':
 *         description: "Dados insuficientes (mín. 3 valores)"
 */
router.get("/estatisticas-vendas", isAuthenticated, checkRole(["gerente"]), RelatorioController.getEstatisticasVendas);


/**
 * @swagger
 * /relatorios/metodos-pagamento:
 *   get:
 *     summary: "(Gerente) Retorna contagem de métodos de pagamento (Pizza)"
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: "Sucesso. Lista de métodos."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   metodo:
 *                     type: string
 *                     example: "pix"
 *                   contagem:
 *                     type: integer
 *                     example: 85
 *       '401':
 *         description: "Acesso negado"
 */
router.get("/metodos-pagamento", isAuthenticated, checkRole(["gerente"]), RelatorioController.getMetodosPagamento);


/**
 * @swagger
 * /relatorios/tempo-medio-atendimento:
 *   get:
 *     summary: "(Gerente) Tempo médio geral dos chamados"
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: "Sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tempoMedioSegundos:
 *                   type: number
 *                   example: 120.5
 *                 totalChamados:
 *                   type: integer
 *                   example: 45
 *       '401':
 *         description: "Acesso negado"
 */

/**
 * @swagger
 * /relatorios/meu-desempenho-atendimento:
 *   get:
 *     summary: "(Garçom) Desempenho do usuário logado em ATENDIMENTO"
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: "Sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tempoMedioSegundos:
 *                   type: number
 *                   example: 120.50
 *                 totalChamados:
 *                   type: integer
 *                   example: 15
 *       '401':
 *         description: "Acesso negado"
 */
router.get(
  "/meu-desempenho-vendas",
  isAuthenticated,
  RelatorioController.getMeuDesempenhoVendas 
);
/**
 * @swagger
 * /relatorios/meu-desempenho-vendas:
 *   get:
 *     summary: "(Garçom) Desempenho do usuário logado em VENDAS"
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: "Sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 faturamentoTotal:
 *                   type: number
 *                   example: 1500.75
 *                 totalPedidos:
 *                   type: integer
 *                   example: 20
 *                 ticketMedio:
 *                   type: number
 *                   example: 75.04
 *       '401':
 *         description: "Acesso negado"
 */
router.get(
  "/meu-desempenho-atendimento",
  isAuthenticated,
  RelatorioController.getMeuDesempenhoAtendimento 
);
module.exports = router;
