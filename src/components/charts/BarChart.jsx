import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatNumber } from '../../utils/formatters'

const COLORS = ['#2563EB', '#F97316', '#0D9488', '#7C3AED', '#DC2626', '#15803D', '#0891B2', '#D97706']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-600 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.fill || entry.color }} />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-semibold text-gray-700">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

function BarChart({
  data = [],
  bars = [],
  xKey = 'name',
  layout = 'vertical',
  height = 280,
  multiColor = false,
}) {
  const isHorizontal = layout === 'horizontal'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        {isHorizontal ? (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatNumber} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={48} />
          </>
        ) : (
          <>
            <XAxis type="number" tickFormatter={formatNumber} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={100} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />}
        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.label || bar.key}
            fill={bar.color || COLORS[i % COLORS.length]}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {multiColor && data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}

export default BarChart