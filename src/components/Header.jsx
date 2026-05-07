import { useState } from 'react'
import { Menu, Bell, User } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Dashboard',
  '/companies': 'Companies',
  '/employees': 'Employees',
  '/payroll': 'Payroll Processing',
  '/payslip': 'Payslips',
  '/taxsheet': 'Tax Sheet',
  '/reports': 'Reports',
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const title = Object.entries(pageTitles).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] || 'PayrollPro'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell size={18} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-700">HR Admin</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  )
}
