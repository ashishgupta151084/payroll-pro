import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, Calculator, FileText,
  BarChart3, ChevronRight, IndianRupee
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/payroll', label: 'Payroll Processing', icon: Calculator },
  { to: '/payslip', label: 'Payslips', icon: FileText },
  { to: '/taxsheet', label: 'Tax Sheet', icon: IndianRupee },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Sidebar({ mobile = false, onClose }) {
  return (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'} bg-gray-900 text-white`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
          <IndianRupee className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white">PayrollPro</div>
          <div className="text-xs text-gray-400">Indian Payroll Manager</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          FY 2025-26 &bull; v1.0.0
        </div>
      </div>
    </div>
  )
}
