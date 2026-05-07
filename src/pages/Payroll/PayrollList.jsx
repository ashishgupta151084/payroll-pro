import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, CheckCircle, Clock, Plus, ChevronRight, Building2 } from 'lucide-react'
import { getCompanies, getPayrollRuns, unfinalizePayroll } from '../../utils/storage'
import { formatMonth, MONTHS } from '../../utils/formatters'

export default function PayrollList() {
  const [companies, setCompanies] = useState([])
  const [runs, setRuns] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const navigate = useNavigate()

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const reload = () => {
    const c = getCompanies()
    setCompanies(c)
    setRuns(getPayrollRuns())
    if (c.length > 0 && !selectedCompany) setSelectedCompany(c[0].id)
  }

  useEffect(() => { reload() }, [])

  // Generate last 12 months
  const months = []
  let m = currentMonth, y = currentYear
  for (let i = 0; i < 12; i++) {
    months.push({ month: m, year: y })
    m--
    if (m === 0) { m = 12; y-- }
  }

  const isFinalized = (companyId, month, year) =>
    runs.some(r => r.companyId === companyId && r.month === month && r.year === year)

  const handleUnfinalize = (companyId, month, year) => {
    if (window.confirm('Unfinalize this payroll? Changes can be made again.')) {
      unfinalizePayroll(companyId, month, year)
      reload()
    }
  }

  const handleRunPayroll = (companyId, month, year) => {
    navigate(`/payroll/run?company=${companyId}&month=${month}&year=${year}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payroll Processing</h2>
          <p className="text-sm text-gray-500 mt-0.5">Run and manage monthly payroll</p>
        </div>
      </div>

      {/* Company Selector */}
      {companies.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {companies.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCompany(c.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selectedCompany === c.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Month Grid */}
      {selectedCompany && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-indigo-600" />
            {companies.find(c => c.id === selectedCompany)?.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {months.map(({ month, year }) => {
              const finalized = isFinalized(selectedCompany, month, year)
              const isCurrent = month === currentMonth && year === currentYear
              return (
                <div
                  key={`${month}-${year}`}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    finalized
                      ? 'border-green-200 bg-green-50'
                      : isCurrent
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-100 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{formatMonth(month, year)}</div>
                      {isCurrent && <div className="text-xs text-indigo-600 font-medium mt-0.5">Current Month</div>}
                    </div>
                    {finalized
                      ? <CheckCircle size={20} className="text-green-500" />
                      : <Clock size={20} className="text-gray-400" />
                    }
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleRunPayroll(selectedCompany, month, year)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        finalized
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {finalized ? 'View' : <><Plus size={12} />Process</>}
                      <ChevronRight size={12} />
                    </button>
                    {finalized && (
                      <button
                        onClick={() => handleUnfinalize(selectedCompany, month, year)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Unfinalize"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {companies.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calculator size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No companies found</p>
          <p className="text-sm">Add a company first before running payroll</p>
        </div>
      )}
    </div>
  )
}
