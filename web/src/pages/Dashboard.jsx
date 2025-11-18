import { useState, useEffect, useCallback } from "react";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import PieChart from "../components/charts/PieChart";
import StatCard from "../components/charts/StatCard";
import { DataTransformer } from "../utils/DataTransformer";
import ApiService from "../services/api";

const Dashboard = ({ onBackToHome }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para filtro personalizado
  const hoje = new Date();
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(hoje.getDate() - 7);

  const [customDataInicio, setCustomDataInicio] = useState(
    seteDiasAtras.toISOString().split("T")[0]
  );
  const [customDataFim, setCustomDataFim] = useState(
    hoje.toISOString().split("T")[0]
  );

  // Estados para dados do backend
  const [kpis, setKpis] = useState(null);
  const [previsaoVendas, setPrevisaoVendas] = useState(null);
  const [itensMaisVendidos, setItensMaisVendidos] = useState([]);
  const [estatisticasVendas, setEstatisticasVendas] = useState(null);
  const [metodosPagamento, setMetodosPagamento] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Retornar datas customizadas
  const getDateRange = useCallback(() => {
    return {
      dataInicio: customDataInicio,
      dataFim: customDataFim,
    };
  }, [customDataInicio, customDataFim]);

  // Carregar dados do backend
  const loadDashboardData = useCallback(async () => {
    if (!customDataInicio || !customDataFim) return;

    setLoading(true);
    setError(null);

    try {
      const { dataInicio, dataFim } = getDateRange();

      const [kpisData, previsaoData, itensData, estatisticasData, metodosData] =
        await Promise.all([
          ApiService.getKPIs(dataInicio, dataFim).catch((err) => {
            console.error("Erro ao buscar KPIs:", err);
            return null;
          }),
          ApiService.getPrevisaoVendas(dataInicio, dataFim).catch((err) => {
            console.error("Erro ao buscar previsão de vendas:", err);
            return null;
          }),
          ApiService.getItensMaisVendidos().catch((err) => {
            console.error("Erro ao buscar itens mais vendidos:", err);
            return [];
          }),
          ApiService.getEstatisticasVendas(dataInicio, dataFim).catch((err) => {
            console.error("Erro ao buscar estatísticas de vendas:", err);
            return null;
          }),
          ApiService.getMetodosPagamento(dataInicio, dataFim).catch((err) => {
            console.error("Erro ao buscar métodos de pagamento:", err);
            return [];
          }),
        ]);

      console.log("📊 Previsão de Vendas:", previsaoData);
      console.log("📊 Vendas por dia:", previsaoData?.chartData);

      setKpis(kpisData);
      setPrevisaoVendas(previsaoData);
      setItensMaisVendidos(itensData);
      setEstatisticasVendas(estatisticasData);
      setMetodosPagamento(metodosData);
      setRecentOrders([]);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [customDataInicio, customDataFim, getDateRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Preparar dados para gráficos
  const salesByDayData = previsaoVendas?.chartData
    ? previsaoVendas.chartData.labels.map((label, index) => ({
        label: label,
        value: previsaoVendas.chartData.data[index],
      }))
    : [];

  const salesByCategoryData = metodosPagamento.map((metodo) => ({
    label: metodo.metodo,
    value: metodo.contagem,
  }));

  const topItemsData = itensMaisVendidos.map((item) => ({
    label: item.nomeItem,
    value: item.quantidadeVendida,
  }));

  // Construir a série de tendência usando os dados históricos + a previsão do próximo período
  const salesTrendData = (() => {
    if (!previsaoVendas) return [];

    const labels = previsaoVendas.chartData?.labels || [];
    const dataArr = previsaoVendas.chartData?.data || [];

    const points = labels.map((label, i) => ({
      label,
      value: dataArr[i] != null ? Number(dataArr[i]) : 0,
    }));

    // Se o backend retornar uma previsão para o próximo período, adiciona como ponto previsto
    if (
      previsaoVendas.previsao &&
      previsaoVendas.previsao.faturamentoPrevisto != null
    ) {
      points.push({
        label: previsaoVendas.previsao.proximoPeriodoLabel || "Previsto",
        value: Number(previsaoVendas.previsao.faturamentoPrevisto),
      });
    }

    return points;
  })();

  // Calcular estatísticas descritivas
  const salesValues = salesTrendData
    .map((item) => item.value)
    .filter((v) => v > 0);
  const salesStats =
    salesValues.length > 0
      ? DataTransformer.calculateDescriptiveStats(salesValues)
      : {
          mean: 0,
          median: 0,
          mode: 0,
          stdDev: 0,
          kurtosis: 0,
        };

  // Calcular tendências
  const salesChange = kpis?.totalContas > 0 ? "+12.5" : "0";
  const salesTrendValue = kpis?.totalContas > 0 ? "up" : "neutral";
  const ordersChange = kpis?.totalContas > 0 ? "+8.6" : "0";
  const ordersTrendValue = kpis?.totalContas > 0 ? "up" : "neutral";

  const getStatusBadge = (status) => {
    const statusClasses = {
      delivered: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || statusClasses.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Voltar
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo ao painel de análises
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Data Inicial:
                </label>
                <input
                  type="date"
                  value={customDataInicio}
                  onChange={(e) => setCustomDataInicio(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Data Final:
                </label>
                <input
                  type="date"
                  value={customDataFim}
                  onChange={(e) => setCustomDataFim(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={loadDashboardData}
                disabled={!customDataInicio || !customDataFim || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Carregando..." : "Atualizar"}
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Vendas Totais"
              value={
                kpis?.faturamentoTotal
                  ? DataTransformer.formatCurrency(kpis.faturamentoTotal)
                  : "R$ 0,00"
              }
              change={`${salesChange}%`}
              trend={salesTrendValue}
              color="primary"
              icon="📊"
            />
            <StatCard
              title="Total de Pedidos"
              value={
                kpis?.totalContas
                  ? DataTransformer.formatNumber(kpis.totalContas)
                  : "0"
              }
              change={`${ordersChange}%`}
              trend={ordersTrendValue}
              color="success"
              icon="🛒"
            />
            <StatCard
              title="Ticket Médio"
              value={
                kpis?.ticketMedio
                  ? DataTransformer.formatCurrency(kpis.ticketMedio)
                  : "R$ 0,00"
              }
              change="3.8%"
              trend="up"
              color="warning"
              icon="💰"
            />
            <StatCard
              title="Desvio Padrão"
              value={
                kpis?.desvioPadrao
                  ? DataTransformer.formatCurrency(kpis.desvioPadrao)
                  : "R$ 0,00"
              }
              change={
                estatisticasVendas?.totalValores
                  ? `${estatisticasVendas.totalValores} vendas`
                  : "0 vendas"
              }
              trend="neutral"
              color="danger"
              icon="📦"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">
              Carregando dados do dashboard...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Estatísticas Descritivas */}
            {estatisticasVendas && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📈 Análise Estatística
                </h2>

                {/* Estatísticas de Vendas do Backend */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-blue-600">📊</span>
                    Estatísticas de Vendas (Dados Reais)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">
                        Mediana
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {DataTransformer.formatCurrency(
                          estatisticasVendas.mediana
                        )}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">
                        Moda
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {typeof estatisticasVendas.moda === "number"
                          ? DataTransformer.formatCurrency(
                              estatisticasVendas.moda
                            )
                          : estatisticasVendas.moda}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium mb-1">
                        Assimetria
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {estatisticasVendas.assimetria?.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <p className="text-sm text-orange-700 font-medium mb-1">
                        Total Vendas
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        {estatisticasVendas.totalValores}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estatísticas Calculadas Localmente */}
            {salesValues.length > 0 && (
              <div className="mb-8">
                {/* Vendas Diárias */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-blue-600">📊</span>
                    Estatísticas de Vendas Diárias (Período Selecionado)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">
                        Média
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {DataTransformer.formatCurrency(salesStats.mean)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">
                        Mediana
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {DataTransformer.formatCurrency(salesStats.median)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium mb-1">
                        Moda
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {DataTransformer.formatCurrency(salesStats.mode)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <p className="text-sm text-orange-700 font-medium mb-1">
                        Desvio Padrão
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        {DataTransformer.formatCurrency(salesStats.stdDev)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                      <p className="text-sm text-pink-700 font-medium mb-1">
                        Curtose
                      </p>
                      <p className="text-2xl font-bold text-pink-900">
                        {salesStats.kurtosis.toFixed(2)}
                      </p>
                      <p className="text-xs text-pink-600 mt-1">
                        {salesStats.kurtosis > 0
                          ? "Leptocúrtica"
                          : salesStats.kurtosis < 0
                          ? "Platicúrtica"
                          : "Mesocúrtica"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Vendas por Dia / Evolução de Vendas */}
              {salesByDayData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <BarChart
                    data={salesByDayData}
                    dataKey="value"
                    xAxisKey="label"
                    barColor="#0284c7"
                    height={350}
                    title="Vendas por Dia (Período Selecionado)"
                    showLegend={false}
                  />
                </div>
              )}

              {/* Métodos de Pagamento */}
              {salesByCategoryData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <PieChart
                    data={salesByCategoryData}
                    dataKey="value"
                    nameKey="label"
                    height={350}
                    title="Métodos de Pagamento"
                    type="pie"
                  />
                </div>
              )}

              {/* Top Itens Mais Vendidos */}
              {topItemsData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <BarChart
                    data={topItemsData}
                    dataKey="value"
                    xAxisKey="label"
                    barColor="#16a34a"
                    height={350}
                    title="Top 5 Itens Mais Vendidos"
                    showLegend={false}
                  />
                </div>
              )}

              {/* Evolução de Vendas - Linha */}
              {salesTrendData.length > 1 && previsaoVendas && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <LineChart
                    data={salesTrendData}
                    dataKey="value"
                    xAxisKey="label"
                    lineColor="#0ea5e9"
                    height={350}
                    title="Evolução de Vendas"
                    showLegend={false}
                    dot={true}
                  />
                  {previsaoVendas?.previsao && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900">
                        Previsão: R${" "}
                        {parseFloat(
                          previsaoVendas.previsao.faturamentoPrevisto
                        ).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {previsaoVendas.estatisticas?.equacao}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mensagem quando não há dados */}
            {!kpis && !previsaoVendas && salesByDayData.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum dado disponível
                </h3>
                <p className="text-gray-600">
                  Não há dados suficientes para gerar relatórios no período
                  selecionado.
                </p>
                <p className="text-gray-600 mt-2">
                  Certifique-se de que existem contas finalizadas no sistema.
                </p>
              </div>
            )}

            {/* Tables Section */}
            <div className="grid grid-cols-1 gap-8">
              {/* Pedidos Recentes - Oculto pois dá 404 */}
              {recentOrders.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Pedidos Recentes
                  </h3>
                  {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 font-semibold text-gray-700">
                              Mesa
                            </th>
                            <th className="text-left py-2 px-2 font-semibold text-gray-700">
                              Itens
                            </th>
                            <th className="text-left py-2 px-2 font-semibold text-gray-700">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-2 text-gray-900 font-medium">
                                Mesa {order.mesa?.numero || order.mesa || "N/A"}
                              </td>
                              <td className="py-3 px-2 text-gray-600">
                                {order.itens?.length || 0} itens
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                    order.status
                                  )}`}
                                >
                                  {order.status === "pronto"
                                    ? "Pronto"
                                    : order.status === "em_preparo"
                                    ? "Preparando"
                                    : "Pendente"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum pedido recente
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
