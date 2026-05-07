import { useState, useEffect, useMemo } from 'react'
import { IndianRupee, ChevronDown, ChevronUp, TrendingDown, CheckCircle } from 'lucide-react'
import { getCompanies, getEmployees } from '../utils/storage'
import { calculateAnnualTax } from '../utils/taxUtils'
import { formatCurrency } from '../utils/formatters'

function TaxRow({ label, value, indent = 0, bold = false, highlight = false, negative = false }) {
  return (
    <tr className={highlight ? 'bg-indigo-50' : ''}>
      <td className={`py-2 px-4 text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}
        style={{ paddingLeft: `${16 + indent * 16}px` }}>
        {label}
      </td>
      <td className={`py-2 px-4 text-right text-sm font-mono ${bold ? 'font-bold' : ''} ${negative ? 'text-red-600' : ''}`}>
        {value !== undefined && value !== null ? formatCurrency(value) : '-'}
      </td>
      <td className={`py-2 px-4 text-right text-sm font-mono ${bold ? 'font-bold' : ''} ${negative ? 'text-red-600' : ''}`}>
        {'-'}
      </td>
    </tr>
  )
}

function EmployeeTaxCard({ employee }) {
  const [expanded, setExpanded] = useState(false)
  const tax = useMemo(() => calculateAnnualTax(employee), [employee])

  const isBetterOld = tax.betterRegime === 'old'
  const isOptedRegime = employee.taxRegime
  const savings = Math.abs(tax.old.totalTax - tax.new.totalTax)
  const isOptimal = tax.betterRegime === isOptedRegime

  return (
    <div className="card overflow-hidden p-0">
      {/* Card header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
            {employee.name?.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900">{employee.name}</div>
            <div className="text-xs text-gray-500">{employee.employeeCode} &bull; {employee.designation}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">Annual CTC</div>
            <div className="font-bold text-gray-900">{formatCurrency(tax.annualCTC)}</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs text-gray-500">Annual Tax</div>
            <div className="font-bold text-red-600">{formatCurrency(tax.applicableTax)}</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs text-gray-500">Monthly TDS</div>
            <div className="font-bold text-orange-600">{formatCurrency(tax.applicableMonthlyTDS)}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isOptedRegime === 'old'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {isOptedRegime === 'old' ? 'Old' : 'New'} Regime
            </span>
            {isOptimal
              ? <CheckCircle size={16} className="text-green-500" />
              : <TrendingDown size={16} className="text-amber-500" />
            }
          </div>
          {expanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Regime Comparison */}
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              {['old', 'new'].map(regime => {
                const t = tax[regime]
                const isSelected = isOptedRegime === regime
                const isBetter = tax.betterRegime === regime
                return (
                  <div key={regime} className={`rounded-xl border-2 p-4 ${isSelected ? 'border-indigo-500 bg-white' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-gray-800 uppercase">
                        {regime === 'old' ? 'Old Regime' : 'New Regime (FY25-26)'}
                      </span>
                      <div className="flex gap-1">
                        {isSelected && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Opted</span>}
                        {isBetter && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Better</span>}
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Gross Income</span>
                        <span className="font-medium">{formatCurrency(t.grossIncome)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Standard Deduction</span>
                        <span className="font-medium text-green-700">-{formatCurrency(t.stdDeduction)}</span>
                      </div>
                      {regime === 'old' && (
                        <>
                          {t.hraExemption > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>HRA Exemption</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.hraExemption)}</span>
                            </div>
                          )}
                          {t.ltaExemption > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>LTA Exemption</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.ltaExemption)}</span>
                            </div>
                          )}
                          {t.conveyanceExemption > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Conveyance Exempt</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.conveyanceExemption)}</span>
                            </div>
                          )}
                          {t.medicalExemption > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Medical Exempt</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.medicalExemption)}</span>
                            </div>
                          )}
                          {t.c80 > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>80C Deduction</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.c80)}</span>
                            </div>
                          )}
                          {t.c80D > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>80D Deduction</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.c80D)}</span>
                            </div>
                          )}
                          {t.c80E > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>80E Deduction</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.c80E)}</span>
                            </div>
                          )}
                          {t.c24b > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>24b (Home Loan)</span>
                              <span className="font-medium text-green-700">-{formatCurrency(t.c24b)}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between text-gray-800 border-t pt-1.5 mt-1.5 font-semibold">
                        <span>Taxable Income</span>
                        <span>{formatCurrency(t.taxableIncome)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Base Tax</span>
                        <span className="font-medium text-red-700">{formatCurrency(t.baseTax)}</span>
                      </div>
                      {t.surcharge > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Surcharge</span>
                          <span className="font-medium text-red-700">{formatCurrency(t.surcharge)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>Cess @4%</span>
                        <span className="font-medium text-red-700">{formatCurrency(t.cess)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1.5 font-bold text-base">
                        <span className="text-gray-900">Annual Tax</span>
                        <span className="text-red-600">{formatCurrency(t.totalTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold bg-orange-50 rounded-lg px-2 py-1.5 -mx-2">
                        <span className="text-orange-800">Monthly TDS</span>
                        <span className="text-orange-700">{formatCurrency(t.monthlyTDS)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recommendation */}
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${isOptimal ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              {isOptimal
                ? `Current choice (${isOptedRegime === 'old' ? 'Old' : 'New'} Regime) is optimal. Annual tax savings vs alternate: ${formatCurrency(savings)}`
                : `Switching to ${tax.betterRegime === 'old' ? 'Old' : 'New'} Regime would save ${formatCurrency(savings)} annually (${formatCurrency(Math.round(savings / 12))}/month).`
              }
            </div>
          </div>

          {/* HRA Breakdown (Old Regime only) */}
          {tax.old.hraExemption > 0 && (
            <div className="px-4 pb-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2">HRA Exemption Breakdown (Old Regime)</h4>
              <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
                <div className="text-xs text-blue-600 font-semibold mb-2">min(Actual HRA, 50%/40% of Basic, Rent - 10% of Basic)</div>
                {(() => {
                  const sal = employee.salary || {}
                  const basic = sal.basic * 12
                  const hra = sal.hra * 12
                  const rent = employee.declarations?.rentPaid || 0
                  const pct = employee.cityType === 'metro' ? 0.5 : 0.4
                  const c1 = hra
                  const c2 = basic * pct
                  const c3 = Math.max(0, rent - basic * 0.10)
                  return [
                    ['Actual HRA (Annual)', c1],
                    [`${employee.cityType === 'metro' ? '50%' : '40%'} of Basic (Annual)`, c2],
                    ['Rent Paid - 10% of Basic (Annual)', c3],
                    ['HRA Exemption (minimum)', tax.old.hraExemption],
                  ].map(([label, val]) => (
                    <div key={label} className={`flex justify-between ${label.includes('minimum') ? 'font-bold border-t border-blue-200 pt-1 mt-1' : ''}`}>
                      <span className="text-blue-800">{label}</span>
                      <span className="font-medium text-blue-900">{formatCurrency(val)}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TaxSheet() {
  const [companies, setCompanies] = useState([])
  const [employees, setEmployees] = useState([])
  const [filterCompany, setFilterCompany] = useState('')

  useEffect(() => {
    setCompanies(getCompanies())
    setEmployees(getEmployees())
  }, [])

  const filtered = filterCompany
    ? employees.filter(e => e.companyId === filterCompany)
    : employees

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tax Sheet</h2>
          <p className="text-sm text-gray-500">FY 2025-26 — Old vs New Regime Comparison</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCompany('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${!filterCompany ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
        >
          All Companies
        </button>
        {companies.map(c => (
          <button
            key={c.id}
            onClick={() => setFilterCompany(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filterCompany === c.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Summary Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Tax Summary — All Employees</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="table-header text-left">Employee</th>
                <th className="table-header text-right">Annual CTC</th>
                <th className="table-header text-right">Old Regime Tax</th>
                <th className="table-header text-right">New Regime Tax</th>
                <th className="table-header text-center">Opted</th>
                <th className="table-header text-right">Tax Payable</th>
                <th className="table-header text-right">Monthly TDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => {
                const tax = calculateAnnualTax(emp)
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.employeeCode}</div>
                    </td>
                    <td className="table-cell text-right">{formatCurrency(tax.annualCTC)}</td>
                    <td className="table-cell text-right">
                      <span className={tax.betterRegime === 'old' ? 'text-green-700 font-semibold' : ''}>
                        {formatCurrency(tax.old.totalTax)}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <span className={tax.betterRegime === 'new' ? 'text-green-700 font-semibold' : ''}>
                        {formatCurrency(tax.new.totalTax)}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.taxRegime === 'old' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {emp.taxRegime === 'old' ? 'Old' : 'New'}
                        {tax.betterRegime === emp.taxRegime ? ' ✓' : ' ⚠'}
                      </span>
                    </td>
                    <td className="table-cell text-right font-bold text-red-600">{formatCurrency(tax.applicableTax)}</td>
                    <td className="table-cell text-right font-bold text-orange-600">{formatCurrency(tax.applicableMonthlyTDS)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td className="table-cell font-bold">TOTAL</td>
                <td className="table-cell text-right font-bold">
                  {formatCurrency(filtered.reduce((s, e) => s + calculateAnnualTax(e).annualCTC, 0))}
                </td>
                <td className="table-cell text-right font-bold">
                  {formatCurrency(filtered.reduce((s, e) => s + calculateAnnualTax(e).old.totalTax, 0))}
                </td>
                <td className="table-cell text-right font-bold">
                  {formatCurrency(filtered.reduce((s, e) => s + calculateAnnualTax(e).new.totalTax, 0))}
                </td>
                <td></td>
                <td className="table-cell text-right font-bold text-red-600">
                  {formatCurrency(filtered.reduce((s, e) => s + calculateAnnualTax(e).applicableTax, 0))}
                </td>
                <td className="table-cell text-right font-bold text-orange-600">
                  {formatCurrency(filtered.reduce((s, e) => s + calculateAnnualTax(e).applicableMonthlyTDS, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Individual Tax Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900">Individual Tax Details</h3>
        {filtered.map(emp => (
          <EmployeeTaxCard key={emp.id} employee={emp} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <IndianRupee size={40} className="mx-auto mb-2 opacity-30" />
            <p>No employees found</p>
          </div>
        )}
      </div>
    </div>
  )
}
