import { useState } from 'react'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import StatCard from '../components/charts/StatCard'
import { DataTransformer } from '../utils/DataTransformer'
import {
  salesByDay,
  salesByCategory,
  stockByBeverage,
  salesTrend as salesTrendData,
  dashboardStats,
  lowStockItems,
  recentOrders
} from '../data/mockData'

const Dashboard = ({ onBackToHome }) => {
  const [timePeriod, setTimePeriod] = useState('week') // 'week', 'month', 'year'

  // Calcular tendências
  const { change: salesChange, trend: salesTrendValue } = DataTransformer.calculateTrend(28500, 25300)
  const { change: ordersChange, trend: ordersTrendValue } = DataTransformer.calculateTrend(342, 315)

  const getStatusBadge = (status) => {
    const statusClasses = {
      delivered: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return statusClasses[status] || statusClasses.pending
  }

  const getStockStatusBadge = (status) => {
    const statusClasses = {
      critical: 'bg-red-100 text-red-800 border border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      ok: 'bg-green-100 text-green-800 border border-green-300'
    }
    return statusClasses[status] || statusClasses.ok
  }

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Bem-vindo ao painel de análises</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setTimePeriod('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timePeriod === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setTimePeriod('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timePeriod === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setTimePeriod('year')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timePeriod === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Ano
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Vendas Totais"
              value={DataTransformer.formatCurrency(28500)}
              change={`${salesChange}%`}
              trend={salesTrendValue}
              color="primary"
              icon="📊"
            />
            <StatCard
              title="Total de Pedidos"
              value={DataTransformer.formatNumber(342)}
              change={`${ordersChange}%`}
              trend={ordersTrendValue}
              color="success"
              icon="🛒"
            />
            <StatCard
              title="Ticket Médio"
              value={DataTransformer.formatCurrency(83.33)}
              change="3.8%"
              trend="up"
              color="warning"
              icon="💰"
            />
            <StatCard
              title="Produtos no Estoque"
              value={DataTransformer.formatNumber(2720)}
              change="2.1%"
              trend="up"
              color="danger"
              icon="📦"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendas por Dia */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <BarChart
              data={salesByDay}
              dataKey="value"
              xAxisKey="label"
              barColor="#0284c7"
              height={350}
              title="Vendas por Dia da Semana"
              showLegend={false}
            />
          </div>

          {/* Vendas por Categoria */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <PieChart
              data={salesByCategory}
              dataKey="value"
              nameKey="label"
              height={350}
              title="Vendas por Categoria"
              type="pie"
            />
          </div>

          {/* Estoque por Bebida */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <BarChart
              data={stockByBeverage}
              dataKey="value"
              xAxisKey="label"
              barColor="#16a34a"
              height={350}
              title="Estoque por Bebida"
              showLegend={false}
            />
          </div>

          {/* Evolução de Vendas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <LineChart
              data={salesTrendData}
              dataKey="value"
              xAxisKey="label"
              lineColor="#0ea5e9"
              height={350}
              title="Evolução de Vendas (12 meses)"
              showLegend={false}
              dot={true}
            />
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produtos com Baixo Estoque */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
               Produtos com Baixo Estoque
            </h3>
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.currentStock} / {item.minimumStock} unidades
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockStatusBadge(item.status)}`}>
                    {item.status === 'critical' ? 'Crítico' : 'Aviso'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pedidos Recentes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📦 Pedidos Recentes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Produto</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Qtd</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-900 font-medium">{order.id}</td>
                      <td className="py-3 px-2 text-gray-600">{order.product}</td>
                      <td className="py-3 px-2 text-gray-600">{order.quantity}</td>
                      <td className="py-3 px-2 text-gray-900 font-medium">
                        {DataTransformer.formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status === 'delivered' ? 'Entregue' : order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
