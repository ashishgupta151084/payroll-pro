import { useState, useEffect, useMemo } from 'react'
import { Download, Printer, FileText } from 'lucide-react'
import { getCompanies, getEmployees, getMonthlyOverrides } from '../utils/storage'
import { calculateMonthlyPayroll } from '../utils/payrollUtils'
import { formatCurrency, formatMonth, MONTHS } from '../utils/formatters'
import { generatePayslipPDF } from '../utils/pdfUtils'

export default function Payslip() {
  const now = new Date()
  const [companies, setCompanies] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  useEffect(() => {
    const c = getCompanies()
    setCompanies(c)
    if (c.length > 0) setSelectedCompany(c[0].id)
  }, [])

  useEffect(() => {
    const emps = getEmployees().filter(e => e.companyId === selectedCompany)
    setEmployees(emps)
    if (emps.length > 0) setSelectedEmployee(emps[0].id)
    else setSelectedEmployee('')
  }, [selectedCompany])

  const employee = employees.find(e => e.id === selectedEmployee)
  const company = companies.find(c => c.id === selectedCompany)

  const payslip = useMemo(() => {
    if (!employee) return null
    try {
      const overrides = getMonthlyOverrides(selectedCompany, month, year)
      return calculateMonthlyPayroll(employee, month, year, overrides[employee.id] || {})
    } catch {
      return null
    }
  }, [employee, month, year, selectedCompany])

  const handlePrint = () => window.print()
  const handleDownload = () => {
    if (payslip && employee && company) {
      generatePayslipPDF(payslip, employee, company)
    }
  }

  const years = []
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) years.push(y)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card no-print">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Payslip</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select className="input-field" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select className="input-field" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select className="input-field" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select className="input-field" value={year} onChange={e => setYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
            <Download size={15} /> Download PDF
          </button>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* Payslip Preview */}
      {payslip && employee && company ? (
        <div id="payslip-preview" className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden print-area max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-indigo-700 text-white px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">{company.name}</h1>
                <p className="text-indigo-200 text-sm mt-1">{company.address}</p>
                <p className="text-indigo-200 text-xs mt-1">
                  PAN: {company.pan} &bull; TAN: {company.tan}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-indigo-600 rounded-xl px-4 py-2">
                  <div className="text-xs text-indigo-200 uppercase font-bold">Payslip</div>
                  <div className="font-bold text-lg">{formatMonth(month, year)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-gray-50 px-8 py-4">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Employee Name</div>
                <div className="font-semibold text-gray-900">{employee.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Employee Code</div>
                <div className="font-semibold text-gray-900 font-mono">{employee.employeeCode}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Designation</div>
                <div className="font-semibold text-gray-900">{employee.designation}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Department</div>
                <div className="font-semibold text-gray-900">{employee.department}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">PAN</div>
                <div className="font-semibold text-gray-900 font-mono">{employee.pan || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Tax Regime</div>
                <div className="font-semibold text-gray-900 capitalize">{employee.taxRegime} Regime</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Bank Account</div>
                <div className="font-semibold text-gray-900 font-mono">{employee.bankAccount || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">IFSC</div>
                <div className="font-semibold text-gray-900 font-mono">{employee.ifsc || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Date of Joining</div>
                <div className="font-semibold text-gray-900">{employee.dateOfJoining || '-'}</div>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Earnings */}
              <div>
                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50 px-3 py-2 rounded-t-lg">Earnings</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Basic Salary', payslip.basic],
                      ['HRA', payslip.hra],
                      ['Conveyance Allowance', payslip.conveyance],
                      ['Medical Reimbursement', payslip.medical],
                      ['LTA', payslip.lta],
                      ['CCA', payslip.cca],
                      ...(payslip.lopDays > 0 ? [[`LOP (${payslip.lopDays} days)`, -Math.round(payslip.lop || 0)]] : []),
                    ].map(([label, amt], i) => (
                      <tr key={label} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="py-1.5 px-3 text-gray-700">{label}</td>
                        <td className={`py-1.5 px-3 text-right font-medium ${amt < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(Math.abs(amt))}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td className="py-1.5 px-3 font-bold text-gray-800">Gross Salary</td>
                      <td className="py-1.5 px-3 text-right font-bold text-gray-900">{formatCurrency(payslip.grossSalary)}</td>
                    </tr>
                    {[
                      ['Cool Off Reimbursement', payslip.coolOff],
                      ['Mobile & Internet', payslip.mobile],
                      ...(payslip.healthInsurance ? [['Health Insurance', payslip.healthInsurance]] : []),
                      ...(payslip.bonus ? [['Bonus', payslip.bonus]] : []),
                    ].map(([label, amt], i) => (
                      <tr key={label} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="py-1.5 px-3 text-gray-700">{label}</td>
                        <td className="py-1.5 px-3 text-right font-medium text-gray-900">{formatCurrency(amt)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-indigo-200 bg-indigo-50">
                      <td className="py-2 px-3 font-bold text-indigo-900">Total CTC</td>
                      <td className="py-2 px-3 text-right font-bold text-indigo-900">{formatCurrency(payslip.ctc)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider bg-red-50 px-3 py-2 rounded-t-lg">Deductions</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Provident Fund (Employee)', payslip.pf],
                      ['Income Tax (TDS)', payslip.tds],
                    ].map(([label, amt], i) => (
                      <tr key={label} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="py-1.5 px-3 text-gray-700">{label}</td>
                        <td className="py-1.5 px-3 text-right font-medium text-red-700">{formatCurrency(amt)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-red-200 bg-red-50">
                      <td className="py-2 px-3 font-bold text-red-900">Total Deductions</td>
                      <td className="py-2 px-3 text-right font-bold text-red-900">{formatCurrency(payslip.totalDeductions)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Net Pay */}
                <div className="mt-6 bg-green-600 text-white rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-green-100">Net Salary (Take Home)</div>
                  <div className="text-3xl font-bold mt-1">{formatCurrency(payslip.netSalary)}</div>
                  <div className="text-xs text-green-100 mt-1">
                    PF: {formatCurrency(payslip.pf)} &bull; TDS: {formatCurrency(payslip.tds)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              This is a computer-generated payslip and does not require a signature. &bull; Generated on {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select an employee to view payslip</p>
        </div>
      )}
    </div>
  )
}
