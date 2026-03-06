import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#2563EB', '#F97316', '#0D9488', '#7C3AED', '#DC2626', '#15803D', '#0891B2']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].payload.fill || payload[0].color }} />
        <span className="text-gray-500">{payload[0].name}:</span>
        <span className="font-semibold text-gray-700">{payload[0].value}%</span>
      </div>
    </div>
  )
}

function PieChart({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  innerRadius = 60,
  height = 280,
  centerLabel,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 50}
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.color || COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
        />
      </RePieChart>
    </ResponsiveContainer>
  )
}

export default PieChart