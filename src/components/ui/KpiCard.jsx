import RoGBadge from './RoGBadge'

function KpiCard({ title, value, subtitle, rog, icon: Icon, iconBg, prefix }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">
            {prefix && <span className="text-lg">{prefix}</span>}
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
          {rog !== undefined && (
            <div className="mt-2">
              <RoGBadge value={rog} />
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg || 'bg-blue-50'}`}>
            <Icon size={22} className="text-brand-blue" />
          </div>
        )}
      </div>
    </div>
  )
}

export default KpiCard