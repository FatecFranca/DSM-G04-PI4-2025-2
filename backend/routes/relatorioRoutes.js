const router = require("express").Router();
const RelatorioController = require("../controllers/RelatorioController");
const isAuthenticated = require("../helpers/isAuthenticated");
const checkRole = require("../helpers/checkRole");

// todas as rotas menos a dos itens mais vendidos podem ser filtradas por data, so passar como query nas variaveis de dataInicio e dataFim.

router.use(isAuthenticated, checkRole(["gerente"]));
// Rota pra pegar faturamento, ticket medio(media), intervalo de confiança, desvio padrao, numero de contas finalizadas.
// Aqui pode usar cards porque são valores fixos
router.get("/kpis", RelatorioController.getKPIs);
// Essa volta previsão futura de faturamento no proximo dia atraves de correlação e regressao
// Aqui pode usar grafico de linha, no json vai ter labels que sera o Eixo X
// O data vai ser o Eixo Y
// A ultima linha do grafico pode ser a de previsao que tem la os eixos X e Y, se tu nao conseguir fazer esse grafico pode fazer um card apenas
router.get("/previsao-vendas", RelatorioController.getPrevisaoVendas);
// 5 itens mais vendidos da loja, usa grafico de barras
router.get("/itens-mais-vendidos", RelatorioController.getItensMaisVendidos);
// aqui retorna moda, mediana, assimentria aqui é card tambem
router.get("/estatisticas-vendas", RelatorioController.getEstatisticasVendas);
// Aqui pode usar o grafico de pizza
router.get("/metodos-pagamento", RelatorioController.getMetodosPagamento);

module.exports = router;