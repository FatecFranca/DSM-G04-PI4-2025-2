/**
 * Dados simulados para dashboard
 * Em produção, esses dados viriam da API
 */

// Vendas por dia (últimos 7 dias)
export const salesByDay = [
  { label: 'Seg', value: 1250 },
  { label: 'Ter', value: 1890 },
  { label: 'Qua', value: 1650 },
  { label: 'Qui', value: 2100 },
  { label: 'Sex', value: 2850 },
  { label: 'Sab', value: 3200 },
  { label: 'Dom', value: 2700 }
]

// Vendas por categoria
export const salesByCategory = [
  { label: 'Cervejas', value: 8500, color: '#0284c7' },
  { label: 'Vinhos', value: 4200, color: '#16a34a' },
  { label: 'Destilados', value: 3800, color: '#dc2626' },
  { label: 'Refrigerantes', value: 2100, color: '#f59e0b' },
  { label: 'Sucos', value: 1500, color: '#8b5cf6' }
]

// Estoque por bebida
export const stockByBeverage = [
  { label: 'Itaipava', value: 450 },
  { label: 'Brahma', value: 380 },
  { label: 'Skol', value: 320 },
  { label: 'Heineken', value: 210 },
  { label: 'Coca Cola', value: 560 }
]

// Evolução de vendas (últimos 12 meses)
export const salesTrend = [
  { label: 'Jan', value: 15000 },
  { label: 'Fev', value: 16800 },
  { label: 'Mar', value: 18200 },
  { label: 'Abr', value: 17500 },
  { label: 'Mai', value: 19200 },
  { label: 'Jun', value: 21500 },
  { label: 'Jul', value: 23400 },
  { label: 'Ago', value: 22100 },
  { label: 'Set', value: 20800 },
  { label: 'Out', value: 24300 },
  { label: 'Nov', value: 26100 },
  { label: 'Dez', value: 28500 }
]

// Estatísticas gerais
export const dashboardStats = {
  totalSales: 28500,
  totalSalesChange: '12.5%',
  totalSalesTrend: 'up',

  totalOrders: 342,
  totalOrdersChange: '8.3%',
  totalOrdersTrend: 'up',

  averageTicket: 83.33,
  averageTicketChange: '3.8%',
  averageTicketTrend: 'up',

  topProduct: 'Itaipava',
  topProductSales: 4520
}

// Produtos com baixo estoque
export const lowStockItems = [
  { name: 'Heineken Premium', currentStock: 12, minimumStock: 50, status: 'critical' },
  { name: 'Corona Extra', currentStock: 28, minimumStock: 50, status: 'warning' },
  { name: 'Vinho Tinto Reserva', currentStock: 5, minimumStock: 20, status: 'critical' }
]

// Pedidos recentes
export const recentOrders = [
  {
    id: '#001',
    product: 'Cervejas Sortidas',
    quantity: 24,
    total: 240,
    status: 'delivered',
    date: '2025-10-18'
  },
  {
    id: '#002',
    product: 'Vinho Branco Português',
    quantity: 6,
    total: 180,
    status: 'delivered',
    date: '2025-10-17'
  },
  {
    id: '#003',
    product: 'Refrigerantes Variados',
    quantity: 30,
    total: 90,
    status: 'pending',
    date: '2025-10-18'
  },
  {
    id: '#004',
    product: 'Suco Natural - Frutas Vermelhas',
    quantity: 12,
    total: 120,
    status: 'delivered',
    date: '2025-10-16'
  }
]

export default {
  salesByDay,
  salesByCategory,
  stockByBeverage,
  salesTrend,
  dashboardStats,
  lowStockItems,
  recentOrders
}
