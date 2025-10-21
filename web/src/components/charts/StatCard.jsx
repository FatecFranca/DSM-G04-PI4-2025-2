/**
 * Card de estatísticas com design shadcn
 */
const StatCard = ({
  title,
  value,
  unit = '',
  change = null,
  icon = null,
  trend = 'neutral', // 'up', 'down', 'neutral'
  color = 'primary',
  onClick = null,
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      icon: 'text-blue-500',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      icon: 'text-green-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      icon: 'text-yellow-500',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      icon: 'text-red-500',
    },
  }

  const currentColor = colorClasses[color] || colorClasses.primary

  const getTrendIcon = () => {
    if (!change) return null

    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-500 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z" clipRule="evenodd" />
        </svg>
      )
    }

    if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-500 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l4.293-4.293a1 1 0 011.414 1.414L8.414 13H12z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  return (
    <div
      onClick={onClick}
      className={`${currentColor.bg} ${currentColor.border} border rounded-lg p-6 transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {change !== null && (
            <p className="text-xs text-gray-600 mt-3">
              {getTrendIcon()}
              <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{change}
              </span>
              {' em relação ao período anterior'}
            </p>
          )}
        </div>
        {icon && (
          <div className={`${currentColor.icon} text-3xl opacity-70`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
