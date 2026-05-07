import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, User, IndianRupee, FileText, Building2 } from 'lucide-react'
import { getCompanies, getEmployee, addEmployee, updateEmployee } from '../../utils/storage'
import { formatCurrency } from '../../utils/formatters'
import { calculateAnnualTax } from '../../utils/taxUtils'

const TABS = ['Basic Info', 'Salary', 'Declarations', 'Preview']

const defaultSalary = {
  basic: 0, hra: 0, conveyance: 1600, medical: 1250, lta: 2500, cca: 0,
  coolOff: 500, mobile: 500, healthInsurance: 650,
  monthlyBonus: 0, annualBonus: 0,
}

const defaultDeclarations = {
  rentPaid: 0, ltaClaimedActual: 0,
  lic: 0, ppf: 0, tuitionFees: 0, housingLoanPrincipal: 0, taxSaverFD: 0, elss: 0,
  medicalInsurance: 0, educationLoanInterest: 0, housingLoanInterest: 0, isSeniorCitizen: false,
}

export default function EmployeeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tab, setTab] = useState(0)
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState({
    name: '', employeeCode: '', designation: '', department: '',
    dateOfJoining: '', companyId: '', taxRegime: 'new', cityType: 'metro',
    pan: '', aadhar: '', bankAccount: '', ifsc: '',
    salary: { ...defaultSalary },
    declarations: { ...defaultDeclarations },
  })

  useEffect(() => {
    setCompanies(getCompanies())
    if (isEdit) {
      const emp = getEmployee(id)
      if (emp) {
        setForm({
          name: emp.name || '',
          employeeCode: emp.employeeCode || '',
          designation: emp.designation || '',
          department: emp.department || '',
          dateOfJoining: emp.dateOfJoining || '',
          companyId: emp.companyId || '',
          taxRegime: emp.taxRegime || 'new',
          cityType: emp.cityType || 'metro',
          pan: emp.pan || '',
          aadhar: emp.aadhar || '',
          bankAccount: emp.bankAccount || '',
          ifsc: emp.ifsc || '',
          salary: { ...defaultSalary, ...(emp.salary || {}) },
          declarations: { ...defaultDeclarations, ...(emp.declarations || {}) },
        })
      }
    }
  }, [id, isEdit])

  const setBasic = (field, value) =>
    setForm(f => ({ ...f, [field]: value }))
  const setSalary = (field, value) =>
    setForm(f => ({ ...f, salary: { ...f.salary, [field]: parseFloat(value) || 0 } }))
  const setDecl = (field, value) =>
    setForm(f => ({ ...f, declarations: { ...f.declarations, [field]: value } }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEdit) {
      updateEmployee(id, form)
    } else {
      addEmployee(form)
    }
    navigate('/employees')
  }

  const sal = form.salary
  const grossFixed = sal.basic + sal.hra + sal.conveyance + sal.medical + sal.lta + sal.cca
  const totalVariable = sal.coolOff + sal.mobile + sal.healthInsurance + (sal.monthlyBonus || 0)
  const monthlyCTC = grossFixed + totalVariable
  const annualCTC = monthlyCTC * 12 + (sal.annualBonus || 0)

  // Tax preview
  const taxPreview = (() => {
    try {
      return calculateAnnualTax(form)
    } catch {
      return null
    }
  })()

  const SectionTitle = ({ icon: Icon, title }) => (
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
      <Icon size={15} className="text-indigo-600" />{title}
    </h3>
  )

  const Field = ({ label, children, required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )

  const NumInput = ({ label, field, prefix = '₹' }) => (
    <Field label={label}>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input
          type="number"
          min="0"
          className={`input-field ${prefix ? 'pl-7' : ''}`}
          value={sal[field] || 0}
          onChange={e => setSalary(field, e.target.value)}
        />
      </div>
    </Field>
  )

  const DeclInput = ({ label, field }) => (
    <Field label={label}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
        <input
          type="number"
          min="0"
          className="input-field pl-7"
          value={form.declarations[field] || 0}
          onChange={e => setDecl(field, parseFloat(e.target.value) || 0)}
        />
      </div>
    </Field>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/employees')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
          <p className="text-sm text-gray-500">{isEdit ? 'Update employee information' : 'Fill in the details below'}</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === i
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tab 0: Basic Info */}
        {tab === 0 && (
          <div className="card space-y-6">
            <SectionTitle icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input required className="input-field" value={form.name}
                  onChange={e => setBasic('name', e.target.value)} placeholder="Kamna Singh" />
              </Field>
              <Field label="Employee Code" required>
                <input required className="input-field font-mono uppercase" value={form.employeeCode}
                  onChange={e => setBasic('employeeCode', e.target.value.toUpperCase())} placeholder="CEL001" />
              </Field>
              <Field label="Designation">
                <input className="input-field" value={form.designation}
                  onChange={e => setBasic('designation', e.target.value)} placeholder="Software Engineer" />
              </Field>
              <Field label="Department">
                <input className="input-field" value={form.department}
                  onChange={e => setBasic('department', e.target.value)} placeholder="Engineering" />
              </Field>
              <Field label="Date of Joining">
                <input type="date" className="input-field" value={form.dateOfJoining}
                  onChange={e => setBasic('dateOfJoining', e.target.value)} />
              </Field>
              <Field label="Company" required>
                <select required className="input-field" value={form.companyId}
                  onChange={e => setBasic('companyId', e.target.value)}>
                  <option value="">-- Select Company --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>

            <SectionTitle icon={FileText} title="Tax & Identity" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tax Regime">
                <select className="input-field" value={form.taxRegime}
                  onChange={e => setBasic('taxRegime', e.target.value)}>
                  <option value="new">New Regime (FY 2025-26)</option>
                  <option value="old">Old Regime</option>
                </select>
              </Field>
              <Field label="City Type (for HRA calculation)">
                <select className="input-field" value={form.cityType}
                  onChange={e => setBasic('cityType', e.target.value)}>
                  <option value="metro">Metro (Mumbai, Delhi, Kolkata, Chennai)</option>
                  <option value="non-metro">Non-Metro</option>
                </select>
              </Field>
              <Field label="PAN Number">
                <input className="input-field font-mono uppercase" value={form.pan}
                  onChange={e => setBasic('pan', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F" maxLength={10} />
              </Field>
              <Field label="Aadhar Number">
                <input className="input-field font-mono" value={form.aadhar}
                  onChange={e => setBasic('aadhar', e.target.value)} placeholder="1234 5678 9012" />
              </Field>
            </div>

            <SectionTitle icon={Building2} title="Bank Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Bank Account Number">
                <input className="input-field font-mono" value={form.bankAccount}
                  onChange={e => setBasic('bankAccount', e.target.value)} placeholder="Account number" />
              </Field>
              <Field label="IFSC Code">
                <input className="input-field font-mono uppercase" value={form.ifsc}
                  onChange={e => setBasic('ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" />
              </Field>
            </div>
          </div>
        )}

        {/* Tab 1: Salary */}
        {tab === 1 && (
          <div className="card space-y-6">
            <SectionTitle icon={IndianRupee} title="Fixed Salary Components (Monthly)" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <NumInput label="Basic Salary" field="basic" />
              <NumInput label="HRA" field="hra" />
              <NumInput label="Conveyance Allowance" field="conveyance" />
              <NumInput label="Medical Reimbursement" field="medical" />
              <NumInput label="LTA" field="lta" />
              <NumInput label="CCA" field="cca" />
            </div>

            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="text-sm font-bold text-indigo-800 mb-2">Gross Fixed (Monthly)</div>
              <div className="text-2xl font-bold text-indigo-600">{formatCurrency(grossFixed)}</div>
            </div>

            <SectionTitle icon={IndianRupee} title="Variable Components (Monthly)" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <NumInput label="Cool Off Reimbursement" field="coolOff" />
              <NumInput label="Mobile & Internet" field="mobile" />
              <NumInput label="Health Insurance" field="healthInsurance" />
              <NumInput label="Monthly Bonus" field="monthlyBonus" />
              <NumInput label="Annual Bonus (one-time)" field="annualBonus" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-xs font-bold text-green-700 uppercase mb-1">Variable (Monthly)</div>
                <div className="text-xl font-bold text-green-700">{formatCurrency(totalVariable)}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-xs font-bold text-blue-700 uppercase mb-1">Monthly CTC</div>
                <div className="text-xl font-bold text-blue-700">{formatCurrency(monthlyCTC)}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-xs font-bold text-purple-700 uppercase mb-1">Annual CTC</div>
                <div className="text-xl font-bold text-purple-700">{formatCurrency(annualCTC)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Declarations (Old Regime) */}
        {tab === 2 && (
          <div className="card space-y-6">
            {form.taxRegime === 'new' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Note:</strong> This employee is on the New Tax Regime. Investment declarations are only applicable for the Old Regime. You can still fill them for comparison purposes.
              </div>
            )}

            <SectionTitle icon={FileText} title="HRA & LTA" />
            <div className="grid grid-cols-2 gap-4">
              <DeclInput label="Annual Rent Paid (for HRA exemption)" field="rentPaid" />
              <DeclInput label="LTA — Actual travel tickets submitted" field="ltaClaimedActual" />
            </div>

            <SectionTitle icon={FileText} title="80C Deductions (Max ₹1,50,000)" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DeclInput label="LIC Premium" field="lic" />
              <DeclInput label="PPF" field="ppf" />
              <DeclInput label="Tuition Fees" field="tuitionFees" />
              <DeclInput label="Housing Loan Principal" field="housingLoanPrincipal" />
              <DeclInput label="Tax Saver FD" field="taxSaverFD" />
              <DeclInput label="ELSS / Tax Saver MF" field="elss" />
            </div>
            {(() => {
              const pf = Math.min((sal.basic || 0) * 0.12, 1800) * 12
              const decl = form.declarations
              const total80C = Math.min((decl.lic || 0) + (decl.ppf || 0) + (decl.tuitionFees || 0) +
                (decl.housingLoanPrincipal || 0) + (decl.taxSaverFD || 0) + (decl.elss || 0) + pf, 150000)
              return (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <span className="text-gray-600">PF auto-included: {formatCurrency(pf)}</span>
                  <span className="mx-3 text-gray-300">|</span>
                  <span className="font-semibold text-gray-800">Total 80C (capped): {formatCurrency(total80C)}</span>
                </div>
              )
            })()}

            <SectionTitle icon={FileText} title="Other Deductions" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <DeclInput label="80D — Medical Insurance (max ₹25,000/₹50,000)" field="medicalInsurance" />
                <div className="mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={form.declarations.isSeniorCitizen || false}
                      onChange={e => setDecl('isSeniorCitizen', e.target.checked)}
                    />
                    Senior Citizen (higher 80D limit of ₹50,000)
                  </label>
                </div>
              </div>
              <DeclInput label="80E — Education Loan Interest (no limit)" field="educationLoanInterest" />
              <DeclInput label="24b — Housing Loan Interest (max ₹2,00,000)" field="housingLoanInterest" />
            </div>
          </div>
        )}

        {/* Tab 3: Preview */}
        {tab === 3 && taxPreview && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Tax Comparison Preview</h3>
              <div className="grid grid-cols-2 gap-6">
                {['old', 'new'].map(regime => {
                  const t = taxPreview[regime]
                  const isApplicable = form.taxRegime === regime
                  return (
                    <div key={regime} className={`rounded-xl p-4 border-2 ${isApplicable ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-bold text-sm ${isApplicable ? 'text-indigo-800' : 'text-gray-700'}`}>
                          {regime === 'old' ? 'Old Regime' : 'New Regime'}
                        </span>
                        {isApplicable && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Selected</span>}
                        {taxPreview.betterRegime === regime && !isApplicable &&
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Better</span>
                        }
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxable Income</span>
                          <span className="font-medium">{formatCurrency(t.taxableIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Tax</span>
                          <span className="font-medium">{formatCurrency(t.baseTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cess @4%</span>
                          <span className="font-medium">{formatCurrency(t.cess)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                          <span className="font-bold text-gray-800">Annual Tax</span>
                          <span className="font-bold text-red-600">{formatCurrency(t.totalTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly TDS</span>
                          <span className="font-bold text-orange-600">{formatCurrency(t.monthlyTDS)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${taxPreview.betterRegime === form.taxRegime ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                {taxPreview.betterRegime === form.taxRegime
                  ? `${form.taxRegime === 'old' ? 'Old' : 'New'} Regime is optimal for this employee.`
                  : `The ${taxPreview.betterRegime === 'old' ? 'Old' : 'New'} Regime would save ${formatCurrency(Math.abs(taxPreview.old.totalTax - taxPreview.new.totalTax))} annually.`
                }
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">Salary Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Monthly Gross', value: grossFixed },
                  { label: 'Monthly CTC', value: monthlyCTC },
                  { label: 'Annual CTC', value: annualCTC },
                  { label: 'Monthly TDS', value: taxPreview.applicableMonthlyTDS },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 font-medium">{label}</div>
                    <div className="text-base font-bold text-gray-900 mt-1">{formatCurrency(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setTab(t => Math.max(0, t - 1))}
            className={`btn-secondary ${tab === 0 ? 'invisible' : ''}`}
          >
            Previous
          </button>
          <div className="flex gap-3">
            {tab < TABS.length - 1 ? (
              <button type="button" onClick={() => setTab(t => t + 1)} className="btn-primary">
                Next
              </button>
            ) : (
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save size={16} /> {isEdit ? 'Update Employee' : 'Save Employee'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
