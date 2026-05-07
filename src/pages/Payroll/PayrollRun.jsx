import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Lock, Unlock, Download, CheckCircle, AlertCircle } from 'lucide-react'
import {
  getEmployeesByCompany, getCompanies, getPayrollRun, finalizePayroll,
  unfinalizePayroll, getMonthlyOverrides, saveMonthlyOverride,
} from '../../utils/storage'
import { calculateMonthlyPayroll, aggregatePayroll } from '../../utils/payrollUtils'
import { formatCurrency, formatMonth } from '../../utils/formatters'
import { generatePayslipPDF } from '../../utils/pdfUtils'

export default function PayrollRun() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const companyId = searchParams.get('company')
  const month = parseInt(searchParams.get('month'))
  const year = parseInt(searchParams.get('year'))

  const [company, setCompany] = useState(null)
  const [employees, setEmployees] = useState([])
  const [overrides, setOverrides] = useState({})
  const [isFinalized, setIsFinalized] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const companies = getCompanies()
    setCompany(companies.find(c => c.id === companyId) || null)
    setEmployees(getEmployeesByCompany(companyId))
    setOverrides(getMonthlyOverrides(companyId, month, year))
    const run = getPayrollRun(companyId, month, year)
    setIsFinalized(!!run)
  }, [companyId, month, year])

  const payroll = useMemo(() =>
    employees.map(emp => calculateMonthlyPayroll(emp, month, year, overrides[emp.id] || {})),
    [employees, month, year, overrides]
  )

  const aggregate = useMemo(() => aggregatePayroll(payroll), [payroll])

  const handleOverrideChange = (empId, field, value) => {
    const num = parseFloat(value) || 0
    setOverrides(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] || {}), [field]: num },
    }))
    setSaved(false)
  }

  const handleSaveOverrides = () => {
    employees.forEach(emp => {
      if (overrides[emp.id]) {
        saveMonthlyOverride(companyId, month, year, emp.id, overrides[emp.id])
      }
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFinalize = () => {
    handleSaveOverrides()
    finalizePayroll(companyId, month, year, payroll)
    setIsFinalized(true)
  }

  const handleUnfinalize = () => {
    unfinalizePayroll(companyId, month, year)
    setIsFinalized(false)
  }

  const handleDownloadPayslip = (payItem) => {
    const emp = employees.find(e => e.id === payItem.employeeId)
    generatePayslipPDF(payItem, emp, company)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/payroll')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">
            {formatMonth(month, year)} Payroll
          </h2>
          <p className="text-sm text-gray-500">{company?.name}</p>
        </div>
        {isFinalized ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} /> Finalized
            </span>
            <button onClick={handleUnfinalize} className="btn-secondary flex items-center gap-2">
              <Unlock size={14} /> Unlock
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleSaveOverrides} className={`btn-secondary flex items-center gap-2 ${saved ? 'text-green-600' : ''}`}>
              {saved ? <CheckCircle size={14} /> : null} Save
            </button>
            <button onClick={handleFinalize} className="btn-primary flex items-center gap-2">
              <Lock size={14} /> Finalize Payroll
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total CTC', value: formatCurrency(aggregate.totalCTC), color: 'text-blue-700 bg-blue-50' },
          { label: 'Total PF', value: formatCurrency(aggregate.totalPF), color: 'text-indigo-700 bg-indigo-50' },
          { label: 'Total TDS', value: formatCurrency(aggregate.totalTDS), color: 'text-orange-700 bg-orange-50' },
          { label: 'Total Net Pay', value: formatCurrency(aggregate.totalNet), color: 'text-green-700 bg-green-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <div className="text-xs font-bold uppercase mb-1 opacity-70">{label}</div>
            <div className="text-xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {!isFinalized && (
        <div className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          Enter LOP days and bonus per employee below. Click Save before Finalizing.
        </div>
      )}

      {/* Payroll Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="table-header text-left">Employee</th>
                <th className="table-header text-right">Basic</th>
                <th className="table-header text-right">Gross</th>
                <th className="table-header text-right">Variable</th>
                <th className="table-header text-right">CTC</th>
                <th className="table-header text-right">PF</th>
                <th className="table-header text-right">TDS</th>
                <th className="table-header text-right">Net Pay</th>
                {!isFinalized && <th className="table-header text-center">LOP Days</th>}
                {!isFinalized && <th className="table-header text-center">Bonus</th>}
                <th className="table-header text-center">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payroll.map((item, idx) => {
                const emp = employees.find(e => e.id === item.employeeId)
                const ovr = overrides[item.employeeId] || {}
                return (
                  <tr key={item.employeeId} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                    <td className="table-cell">
                      <div className="font-semibold text-gray-900">{item.employeeName}</div>
                      <div className="text-xs text-gray-500">{emp?.employeeCode}</div>
                    </td>
                    <td className="table-cell text-right">{formatCurrency(item.basic)}</td>
                    <td className="table-cell text-right">{formatCurrency(item.grossSalary)}</td>
                    <td className="table-cell text-right">{formatCurrency(item.totalVariable)}</td>
                    <td className="table-cell text-right font-semibold">{formatCurrency(item.ctc)}</td>
                    <td className="table-cell text-right text-orange-700">{formatCurrency(item.pf)}</td>
                    <td className="table-cell text-right text-red-700">{formatCurrency(item.tds)}</td>
                    <td className="table-cell text-right font-bold text-green-700">{formatCurrency(item.netSalary)}</td>
                    {!isFinalized && (
                      <td className="table-cell text-center">
                        <input
                          type="number"
                          min="0"
                          max="31"
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={ovr.lop || 0}
                          onChange={e => handleOverrideChange(item.employeeId, 'lop', e.target.value)}
                        />
                      </td>
                    )}
                    {!isFinalized && (
                      <td className="table-cell text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={ovr.bonus !== undefined ? ovr.bonus : (emp?.salary?.monthlyBonus || 0)}
                          onChange={e => handleOverrideChange(item.employeeId, 'bonus', e.target.value)}
                        />
                      </td>
                    )}
                    <td className="table-cell text-center">
                      <button
                        onClick={() => handleDownloadPayslip(item)}
                        className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title="Download Payslip"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {payroll.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-400">
                    No employees found for this company
                  </td>
                </tr>
              )}
            </tbody>
            {payroll.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td className="table-cell font-bold text-gray-900">TOTAL ({aggregate.count} employees)</td>
                  <td className="table-cell text-right font-bold"></td>
                  <td className="table-cell text-right font-bold">{formatCurrency(aggregate.totalGross)}</td>
                  <td className="table-cell text-right font-bold"></td>
                  <td className="table-cell text-right font-bold">{formatCurrency(aggregate.totalCTC)}</td>
                  <td className="table-cell text-right font-bold text-orange-700">{formatCurrency(aggregate.totalPF)}</td>
                  <td className="table-cell text-right font-bold text-red-700">{formatCurrency(aggregate.totalTDS)}</td>
                  <td className="table-cell text-right font-bold text-green-700">{formatCurrency(aggregate.totalNet)}</td>
                  {!isFinalized && <td></td>}
                  {!isFinalized && <td></td>}
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
