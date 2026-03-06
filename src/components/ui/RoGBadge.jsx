import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function RoGBadge({ value }) {
  if (!value && value !== 0) return <span className="text-gray-400 text-xs">—</span>

  const isPositive = value > 0
  const isZero     = value === 0

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      isZero     ? 'bg-gray-100 text-gray-500' :
      isPositive ? 'bg-green-100 text-green-700' :
                   'bg-red-100 text-red-600'
    }`}>
      {isZero     ? <Minus size={11} /> :
       isPositive ? <TrendingUp size={11} /> :
                    <TrendingDown size={11} />}
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

export default RoGBadge