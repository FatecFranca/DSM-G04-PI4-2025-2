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

  /**
   * Calcula a média de um array de valores
   */
  calculateMean: (values) => {
    if (!values || values.length === 0) return 0
    const sum = values.reduce((acc, val) => acc + val, 0)
    return sum / values.length
  },

  /**
   * Calcula a mediana de um array de valores
   */
  calculateMedian: (values) => {
    if (!values || values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  },

  /**
   * Calcula a moda de um array de valores
   */
  calculateMode: (values) => {
    if (!values || values.length === 0) return 0
    const frequency = {}
    let maxFreq = 0
    let mode = values[0]

    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val]
        mode = val
      }
    })

    return mode
  },

  /**
   * Calcula o desvio padrão de um array de valores
   */
  calculateStandardDeviation: (values) => {
    if (!values || values.length === 0) return 0
    const mean = DataTransformer.calculateMean(values)
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
    return Math.sqrt(avgSquaredDiff)
  },

  /**
   * Calcula a curtose de um array de valores
   */
  calculateKurtosis: (values) => {
    if (!values || values.length === 0) return 0
    const n = values.length
    const mean = DataTransformer.calculateMean(values)
    const stdDev = DataTransformer.calculateStandardDeviation(values)
    
    if (stdDev === 0) return 0
    
    const fourthMoment = values.reduce((acc, val) => {
      return acc + Math.pow((val - mean) / stdDev, 4)
    }, 0) / n
    
    // Curtose de Fisher (excess kurtosis)
    return fourthMoment - 3
  },

  /**
   * Calcula todas as estatísticas descritivas de uma vez
   */
  calculateDescriptiveStats: (values) => {
    if (!values || values.length === 0) {
      return {
        mean: 0,
        median: 0,
        mode: 0,
        stdDev: 0,
        kurtosis: 0,
        min: 0,
        max: 0,
        count: 0
      }
    }

    return {
      mean: DataTransformer.calculateMean(values),
      median: DataTransformer.calculateMedian(values),
      mode: DataTransformer.calculateMode(values),
      stdDev: DataTransformer.calculateStandardDeviation(values),
      kurtosis: DataTransformer.calculateKurtosis(values),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }
  }
}

export default DataTransformer
