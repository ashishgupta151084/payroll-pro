import { useState, useEffect, useMemo } from 'react'
import { BarChart3, Download, FileSpreadsheet, Users, IndianRupee, TrendingUp } from 'lucide-react'
import { getCompanies, getEmployees } from '../utils/storage'
import { calculateMonthlyPayroll } from '../utils/payrollUtils'
import { calculateAnnualTax } from '../utils/taxUtils'
import { formatCurrency, formatMonth, MONTHS, currentFY, getFYMonths } from '../utils/formatters'

const REPORT_TYPES = [
  { id: 'payroll-summary', label: 'Payroll Summary', icon: IndianRupee },
  { id: 'annual-salary', label: 'Annual Salary Register', icon: TrendingUp },
  { id: 'tds-summary', label: 'TDS Summary (Form 24Q)', icon: FileSpreadsheet },
  { id: 'pf-register', label: 'PF Register', icon: Users },
]

export default function Reports() {
  const now = new Date()
  const [companies, setCompanies] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [activeReport, setActiveReport] = useState('payroll-summary')
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const fy = currentFY()

  useEffect(() => {
    const c = getCompanies()
    setCompanies(c)
    setEmployees(getEmployees())
    if (c.length > 0) setSelectedCompany(c[0].id)
  }, [])

  const companyEmployees = useMemo(() =>
    employees.filter(e => !selectedCompany || e.companyId === selectedCompany),
    [employees, selectedCompany]
  )

  // Monthly payroll summary
  const monthlyPayroll = useMemo(() =>
    companyEmployees.map(emp => calculateMonthlyPayroll(emp, month, year)),
    [companyEmployees, month, year]
  )

  // Annual payroll - FY months
  const fyMonths = getFYMonths(fy)
  const annualPayroll = useMemo(() =>
    companyEmployees.map(emp => {
      const months = fyMonths.map(({ month: m, year: y }) => calculateMonthlyPayroll(emp, m, y))
      return { emp, months }
    }),
    [companyEmployees, fy]
  )

  const handleExportCSV = (data, filename) => {
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportMonthlyPayroll = () => {
    const headers = ['Employee', 'Code', 'Designation', 'Basic', 'HRA', 'Conveyance', 'Medical', 'LTA', 'CCA', 'Gross', 'Cool Off', 'Mobile', 'Health Ins', 'Bonus', 'CTC', 'PF', 'TDS', 'Net Pay']
    const rows = monthlyPayroll.map(p => {
      const emp = companyEmployees.find(e => e.id === p.employeeId)
      return [
        p.employeeName, emp?.employeeCode, emp?.designation,
        p.basic, p.hra, p.conveyance, p.medical, p.lta, p.cca,
        p.grossSalary, p.coolOff, p.mobile, p.healthInsurance, p.bonus,
        p.ctc, p.pf, p.tds, p.netSalary,
      ]
    })
    handleExportCSV([headers, ...rows], `Payroll_${formatMonth(month, year)}.csv`)
  }

  const exportTDSSummary = () => {
    const headers = ['Employee Name', 'PAN', 'Designation', 'Annual CTC', 'Taxable Income (New)', 'Taxable Income (Old)', 'Tax (New)', 'Tax (Old)', 'Opted Regime', 'Annual TDS', 'Monthly TDS']
    const rows = companyEmployees.map(emp => {
      const tax = calculateAnnualTax(emp)
      return [
        emp.name, emp.pan, emp.designation,
        tax.annualCTC,
        tax.new.taxableIncome, tax.old.taxableIncome,
        tax.new.totalTax, tax.old.totalTax,
        emp.taxRegime, tax.applicableTax, tax.applicableMonthlyTDS,
      ]
    })
    handleExportCSV([headers, ...rows], `TDS_Summary_FY${fy}-${fy + 1}.csv`)
  }

  const exportPFRegister = () => {
    const headers = ['Month', 'Employee', 'Code', 'Basic Salary', 'PF Rate', 'Employee PF', 'Employer PF (Est.)', 'Total PF']
    const rows = []
    fyMonths.forEach(({ month: m, year: y }) => {
      companyEmployees.forEach(emp => {
        const p = calculateMonthlyPayroll(emp, m, y)
        const employerPF = p.pf // Equal contribution
        rows.push([formatMonth(m, y), p.employeeName, emp.employeeCode, p.basic, '12%', p.pf, employerPF, p.pf * 2])
      })
    })
    handleExportCSV([headers, ...rows], `PF_Register_FY${fy}-${fy + 1}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500">Payroll, TDS, PF and salary reports</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {REPORT_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveReport(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              activeReport === id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select className="input-field min-w-[200px]" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
              <option value="">All Companies</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {(activeReport === 'payroll-summary') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select className="input-field" value={month} onChange={e => setMonth(Number(e.target.value))}>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select className="input-field" value={year} onChange={e => setYear(Number(e.target.value))}>
                  {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="ml-auto">
            {activeReport === 'payroll-summary' && (
              <button onClick={exportMonthlyPayroll} className="btn-primary flex items-center gap-2">
                <Download size={14} /> Export CSV
              </button>
            )}
            {activeReport === 'tds-summary' && (
              <button onClick={exportTDSSummary} className="btn-primary flex items-center gap-2">
                <Download size={14} /> Export CSV
              </button>
            )}
            {activeReport === 'pf-register' && (
              <button onClick={exportPFRegister} className="btn-primary flex items-center gap-2">
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report: Payroll Summary */}
      {activeReport === 'payroll-summary' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Payroll Summary — {formatMonth(month, year)}</h3>
            <span className="text-sm text-gray-500">{monthlyPayroll.length} employees</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header text-left">Employee</th>
                  <th className="table-header text-right">Basic</th>
                  <th className="table-header text-right">HRA</th>
                  <th className="table-header text-right">Other Fixed</th>
                  <th className="table-header text-right">Gross</th>
                  <th className="table-header text-right">Variable</th>
                  <th className="table-header text-right">CTC</th>
                  <th className="table-header text-right">PF</th>
                  <th className="table-header text-right">TDS</th>
                  <th className="table-header text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthlyPayroll.map((p, i) => (
                  <tr key={p.employeeId} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{p.employeeName}</div>
                      <div className="text-xs text-gray-400">{companyEmployees.find(e => e.id === p.employeeId)?.employeeCode}</div>
                    </td>
                    <td className="table-cell text-right">{formatCurrency(p.basic)}</td>
                    <td className="table-cell text-right">{formatCurrency(p.hra)}</td>
                    <td className="table-cell text-right">{formatCurrency(p.conveyance + p.medical + p.lta + p.cca)}</td>
                    <td className="table-cell text-right">{formatCurrency(p.grossSalary)}</td>
                    <td className="table-cell text-right">{formatCurrency(p.totalVariable)}</td>
                    <td className="table-cell text-right font-semibold">{formatCurrency(p.ctc)}</td>
                    <td className="table-cell text-right text-orange-700">{formatCurrency(p.pf)}</td>
                    <td className="table-cell text-right text-red-700">{formatCurrency(p.tds)}</td>
                    <td className="table-cell text-right font-bold text-green-700">{formatCurrency(p.netSalary)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td className="table-cell font-bold text-gray-900">TOTAL</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.basic, 0))}</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.hra, 0))}</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.conveyance + p.medical + p.lta + p.cca, 0))}</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.grossSalary, 0))}</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.totalVariable, 0))}</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.ctc, 0))}</td>
                  <td className="table-cell text-right font-bold text-orange-700">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.pf, 0))}</td>
                  <td className="table-cell text-right font-bold text-red-700">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.tds, 0))}</td>
                  <td className="table-cell text-right font-bold text-green-700">{formatCurrency(monthlyPayroll.reduce((s, p) => s + p.netSalary, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Report: Annual Salary Register */}
      {activeReport === 'annual-salary' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Annual Salary Register — FY {fy}-{fy + 1}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header text-left sticky left-0 bg-gray-50 z-10">Employee</th>
                  {fyMonths.map(({ month: m, year: y }) => (
                    <th key={`${m}-${y}`} className="table-header text-right whitespace-nowrap">
                      {formatMonth(m, y).split(' ')[0].slice(0, 3)} {y}
                    </th>
                  ))}
                  <th className="table-header text-right">Annual CTC</th>
                  <th className="table-header text-right">Annual TDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {annualPayroll.map(({ emp, months: payMonths }, i) => {
                  const annualCTC = payMonths.reduce((s, p) => s + p.ctc, 0)
                  const annualTDS = payMonths.reduce((s, p) => s + p.tds, 0)
                  return (
                    <tr key={emp.id} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <td className="table-cell sticky left-0 bg-white z-10">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.employeeCode}</div>
                      </td>
                      {payMonths.map((p, j) => (
                        <td key={j} className="table-cell text-right whitespace-nowrap">{formatCurrency(p.ctc)}</td>
                      ))}
                      <td className="table-cell text-right font-bold text-blue-700">{formatCurrency(annualCTC)}</td>
                      <td className="table-cell text-right font-bold text-red-600">{formatCurrency(annualTDS)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report: TDS Summary */}
      {activeReport === 'tds-summary' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">TDS Summary — FY {fy}-{fy + 1} (Form 24Q Data)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header text-left">Employee</th>
                  <th className="table-header text-left">PAN</th>
                  <th className="table-header text-right">Annual CTC</th>
                  <th className="table-header text-right">Taxable (New)</th>
                  <th className="table-header text-right">Taxable (Old)</th>
                  <th className="table-header text-center">Opted</th>
                  <th className="table-header text-right">Annual Tax</th>
                  <th className="table-header text-right">Cess</th>
                  <th className="table-header text-right">Monthly TDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companyEmployees.map((emp, i) => {
                  const tax = calculateAnnualTax(emp)
                  const t = tax[emp.taxRegime]
                  return (
                    <tr key={emp.id} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.designation}</div>
                      </td>
                      <td className="table-cell font-mono text-gray-600">{emp.pan || 'Not Set'}</td>
                      <td className="table-cell text-right">{formatCurrency(tax.annualCTC)}</td>
                      <td className="table-cell text-right">{formatCurrency(tax.new.taxableIncome)}</td>
                      <td className="table-cell text-right">{formatCurrency(tax.old.taxableIncome)}</td>
                      <td className="table-cell text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          emp.taxRegime === 'old' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {emp.taxRegime === 'old' ? 'Old' : 'New'}
                        </span>
                      </td>
                      <td className="table-cell text-right font-bold text-red-600">{formatCurrency(tax.applicableTax)}</td>
                      <td className="table-cell text-right">{formatCurrency(t.cess)}</td>
                      <td className="table-cell text-right font-bold text-orange-600">{formatCurrency(tax.applicableMonthlyTDS)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td className="table-cell font-bold" colSpan={2}>TOTAL</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(companyEmployees.reduce((s, e) => s + calculateAnnualTax(e).annualCTC, 0))}</td>
                  <td colSpan={3}></td>
                  <td className="table-cell text-right font-bold text-red-600">{formatCurrency(companyEmployees.reduce((s, e) => s + calculateAnnualTax(e).applicableTax, 0))}</td>
                  <td></td>
                  <td className="table-cell text-right font-bold text-orange-600">{formatCurrency(companyEmployees.reduce((s, e) => s + calculateAnnualTax(e).applicableMonthlyTDS, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Report: PF Register */}
      {activeReport === 'pf-register' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">PF Register — FY {fy}-{fy + 1}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header text-left">Employee</th>
                  <th className="table-header text-right">Monthly Basic</th>
                  <th className="table-header text-right">PF @12%</th>
                  <th className="table-header text-right">Monthly PF</th>
                  <th className="table-header text-right">Annual PF (Employee)</th>
                  <th className="table-header text-right">Annual PF (Employer Est.)</th>
                  <th className="table-header text-right">Total Annual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companyEmployees.map((emp, i) => {
                  const monthlyPF = Math.min(Math.round((emp.salary?.basic || 0) * 0.12), 1800)
                  const annualPF = monthlyPF * 12
                  return (
                    <tr key={emp.id} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.employeeCode}</div>
                      </td>
                      <td className="table-cell text-right">{formatCurrency(emp.salary?.basic || 0)}</td>
                      <td className="table-cell text-right text-gray-500">12% (max ₹1,800)</td>
                      <td className="table-cell text-right font-medium">{formatCurrency(monthlyPF)}</td>
                      <td className="table-cell text-right text-orange-700">{formatCurrency(annualPF)}</td>
                      <td className="table-cell text-right text-blue-700">{formatCurrency(annualPF)}</td>
                      <td className="table-cell text-right font-bold text-indigo-700">{formatCurrency(annualPF * 2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td className="table-cell font-bold">TOTAL</td>
                  <td></td>
                  <td></td>
                  <td className="table-cell text-right font-bold">
                    {formatCurrency(companyEmployees.reduce((s, e) => s + Math.min(Math.round((e.salary?.basic || 0) * 0.12), 1800), 0))}
                  </td>
                  <td className="table-cell text-right font-bold text-orange-700">
                    {formatCurrency(companyEmployees.reduce((s, e) => s + Math.min(Math.round((e.salary?.basic || 0) * 0.12), 1800) * 12, 0))}
                  </td>
                  <td className="table-cell text-right font-bold text-blue-700">
                    {formatCurrency(companyEmployees.reduce((s, e) => s + Math.min(Math.round((e.salary?.basic || 0) * 0.12), 1800) * 12, 0))}
                  </td>
                  <td className="table-cell text-right font-bold text-indigo-700">
                    {formatCurrency(companyEmployees.reduce((s, e) => s + Math.min(Math.round((e.salary?.basic || 0) * 0.12), 1800) * 24, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
