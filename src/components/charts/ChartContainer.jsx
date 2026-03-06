import { Download } from 'lucide-react'

function ChartContainer({ title, subtitle, children, onExport }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <Download size={13} />
            Export
          </button>
        )}
      </div>

      {/* Chart */}
      {children}
    </div>
  )
}

export default ChartContainer