import { Inbox } from 'lucide-react'

function EmptyState({ title = 'No data found', subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Inbox size={32} className="text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-600">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-1 max-w-xs">{subtitle}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  )
}

export default EmptyState