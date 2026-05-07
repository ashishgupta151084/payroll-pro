import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, IndianRupee, TrendingUp, Calculator, FileText, CheckCircle, Clock } from 'lucide-react'
import StatCard from '../components/StatCard'
import { getCompanies, getEmployees, getPayrollRuns } from '../utils/storage'
import { calculateMonthlyPayroll } from '../utils/payrollUtils'
import { formatCurrency, formatMonth } from '../utils/formatters'

export default function Dashboard() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const data = useMemo(() => {
    const companies = getCompanies()
    const employees = getEmployees()
    const runs = getPayrollRuns()

    // Calculate current month payroll for all employees
    const currentPayroll = employees.map(emp => {
      try {
        return calculateMonthlyPayroll(emp, currentMonth, currentYear)
      } catch {
        return null
      }
    }).filter(Boolean)

    const totalNetSalary = currentPayroll.reduce((s, p) => s + p.netSalary, 0)
    const totalCTC = currentPayroll.reduce((s, p) => s + p.ctc, 0)
    const totalTDS = currentPayroll.reduce((s, p) => s + p.tds, 0)
    const totalPF = currentPayroll.reduce((s, p) => s + p.pf, 0)

    // Check which companies have finalized this month
    const finalizedCount = companies.filter(c =>
      runs.some(r => r.companyId === c.id && r.month === currentMonth && r.year === currentYear)
    ).length

    return {
      companies,
      employees,
      totalNetSalary,
      totalCTC,
      totalTDS,
      totalPF,
      finalizedCount,
    }
  }, [currentMonth, currentYear])

  const companyPayrolls = useMemo(() => {
    const companies = getCompanies()
    const employees = getEmployees()
    return companies.map(company => {
      const companyEmps = employees.filter(e => e.companyId === company.id)
      const payrolls = companyEmps.map(emp => {
        try {
          return calculateMonthlyPayroll(emp, currentMonth, currentYear)
        } catch {
          return null
        }
      }).filter(Boolean)
      const totalCTC = payrolls.reduce((s, p) => s + p.ctc, 0)
      return { company, count: companyEmps.length, totalCTC }
    })
  }, [currentMonth, currentYear])

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome to PayrollPro</h2>
        <p className="text-indigo-200 text-sm mt-1">
          Indian Payroll Management System &bull; FY 2025-26
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/payroll" className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors">
            Run Payroll
          </Link>
          <Link to="/employees" className="border border-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Manage Employees
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={data.employees.length}
          subtitle={`Across ${data.companies.length} companies`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total CTC (This Month)"
          value={formatCurrency(data.totalCTC)}
          subtitle={formatMonth(currentMonth, currentYear)}
          icon={IndianRupee}
          color="green"
        />
        <StatCard
          title="TDS Payable"
          value={formatCurrency(data.totalTDS)}
          subtitle="This month"
          icon={Calculator}
          color="orange"
        />
        <StatCard
          title="PF Contribution"
          value={formatCurrency(data.totalPF)}
          subtitle="Employee contribution"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Company-wise breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            Company Overview
          </h3>
          <div className="space-y-3">
            {companyPayrolls.map(({ company, count, totalCTC }) => (
              <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">{count} employees</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-700">{formatCurrency(totalCTC)}</div>
                  <div className="text-xs text-gray-500">monthly CTC</div>
                </div>
              </div>
            ))}
            {companyPayrolls.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No companies found</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            {formatMonth(currentMonth, currentYear)} Payroll Status
          </h3>
          <div className="space-y-3">
            {data.companies.map(company => {
              const runs = getPayrollRuns()
              const isFinalized = runs.some(r =>
                r.companyId === company.id && r.month === currentMonth && r.year === currentYear
              )
              return (
                <div key={company.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">
                      {isFinalized ? 'Payroll finalized' : 'Pending processing'}
                    </div>
                  </div>
                  {isFinalized ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> Finalized
                    </span>
                  ) : (
                    <Link to="/payroll" className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full hover:bg-indigo-200 transition-colors">
                      Process Now
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/payslip', label: 'View Payslips', icon: FileText },
                { to: '/taxsheet', label: 'Tax Sheet', icon: Calculator },
                { to: '/reports', label: 'Reports', icon: TrendingUp },
                { to: '/employees', label: 'Add Employee', icon: Users },
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors text-sm font-medium"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Net salary summary */}
      <div className="card">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Salary Summary — {formatMonth(currentMonth, currentYear)}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header text-left rounded-l-lg">Metric</th>
                <th className="table-header text-right rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { label: 'Total Gross Salary', value: data.totalCTC - data.employees.reduce((s, e) => {
                  const sal = e.salary || {}
                  return s + (sal.coolOff || 0) + (sal.mobile || 0) + (sal.healthInsurance || 0)
                }, 0) },
                { label: 'Total Variable Pay', value: data.employees.reduce((s, e) => {
                  const sal = e.salary || {}
                  return s + (sal.coolOff || 0) + (sal.mobile || 0) + (sal.healthInsurance || 0)
                }, 0) },
                { label: 'Total CTC', value: data.totalCTC },
                { label: 'Total PF (Employee)', value: data.totalPF },
                { label: 'Total TDS', value: data.totalTDS },
                { label: 'Total Net Salary', value: data.totalNetSalary, bold: true },
              ].map(({ label, value, bold }) => (
                <tr key={label} className={bold ? 'bg-indigo-50' : ''}>
                  <td className={`table-cell ${bold ? 'font-bold text-indigo-800' : ''}`}>{label}</td>
                  <td className={`table-cell text-right ${bold ? 'font-bold text-indigo-800' : ''}`}>
                    {formatCurrency(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
