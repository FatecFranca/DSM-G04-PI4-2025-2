import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/**
 * Gráfico de Pizza com Recharts (shadcn compatible)
 * Compatível com Web e React Native
 */
const PieChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'label',
  height = 300,
  title = '',
  showLegend = true,
  type = 'pie', // 'pie' ou 'donut'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-400 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3a9 9 0 019 9m0 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Nenhum dado disponível
        </p>
      </div>
    )
  }

  // Gerar cores se não existirem
  const colors = [
    '#0284c7',
    '#16a34a',
    '#dc2626',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
  ]

  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length],
  }))

  const innerRadius = type === 'donut' ? 60 : 0

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={dataWithColors}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              dataKey={dataKey}
              nameKey={nameKey}
              label={(entry) => `${entry.name}: ${entry.value}`}
              isAnimationActive={true}
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => value.toLocaleString('pt-BR')}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            {showLegend && <Legend />}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PieChart
