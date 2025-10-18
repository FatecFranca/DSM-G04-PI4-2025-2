/**
 * Utilitários para transformação de dados e formatação
 * Compatível com Web e React Native
 */

export const DataTransformer = {
  /**
   * Normaliza valores para escala de 0-100
   */
  normalize: (values) => {
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    return values.map(v => ((v - min) / range) * 100)
  },

  /**
   * Calcula estatísticas básicas
   */
  calculateStats: (values) => {
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    return { sum, avg, max, min }
  },

  /**
   * Formata valor monetário
   */
  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  },

  /**
   * Formata número com separador de milhar
   */
  formatNumber: (value, decimals = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  },

  /**
   * Calcula tendência entre dois valores
   */
  calculateTrend: (current, previous) => {
    if (previous === 0) return { change: '∞', trend: 'neutral' }
    const change = (((current - previous) / previous) * 100).toFixed(1)
    return {
      change: Math.abs(change),
      trend: current > previous ? 'up' : current < previous ? 'down' : 'neutral',
    }
  },

  /**
   * Formata data em português
   */
  formatDate: (date, format = 'DD/MM/YYYY') => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year)
  },
}

export default DataTransformer
