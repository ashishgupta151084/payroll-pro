export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-700' },
    green: { bg: 'bg-green-50', icon: 'bg-green-600', text: 'text-green-700' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-700' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-700' },
    red: { bg: 'bg-red-50', icon: 'bg-red-600', text: 'text-red-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-700' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`${c.icon} p-3 rounded-xl`}>
            <Icon size={20} className="text-white" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  )
}
