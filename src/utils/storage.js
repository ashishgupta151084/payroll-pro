const KEYS = {
  COMPANIES: 'payrollpro_companies',
  EMPLOYEES: 'payrollpro_employees',
  PAYROLL_RUNS: 'payrollpro_payroll_runs',
  PAYROLL_OVERRIDES: 'payrollpro_payroll_overrides',
  INITIALIZED: 'payrollpro_initialized_v2', // Bump version to re-seed corrected sample data
}

const get = (key) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

const set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// Companies
export const getCompanies = () => get(KEYS.COMPANIES) || []
export const saveCompanies = (companies) => set(KEYS.COMPANIES, companies)
export const addCompany = (company) => {
  const companies = getCompanies()
  const newCompany = { ...company, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  companies.push(newCompany)
  saveCompanies(companies)
  return newCompany
}
export const updateCompany = (id, data) => {
  const companies = getCompanies()
  const idx = companies.findIndex(c => c.id === id)
  if (idx >= 0) {
    companies[idx] = { ...companies[idx], ...data }
    saveCompanies(companies)
    return companies[idx]
  }
  return null
}
export const deleteCompany = (id) => {
  const companies = getCompanies().filter(c => c.id !== id)
  saveCompanies(companies)
}

// Employees
export const getEmployees = () => get(KEYS.EMPLOYEES) || []
export const saveEmployees = (employees) => set(KEYS.EMPLOYEES, employees)
export const getEmployeesByCompany = (companyId) =>
  getEmployees().filter(e => e.companyId === companyId)
export const getEmployee = (id) => getEmployees().find(e => e.id === id)
export const addEmployee = (employee) => {
  const employees = getEmployees()
  const newEmployee = { ...employee, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  employees.push(newEmployee)
  saveEmployees(employees)
  return newEmployee
}
export const updateEmployee = (id, data) => {
  const employees = getEmployees()
  const idx = employees.findIndex(e => e.id === id)
  if (idx >= 0) {
    employees[idx] = { ...employees[idx], ...data }
    saveEmployees(employees)
    return employees[idx]
  }
  return null
}
export const deleteEmployee = (id) => {
  const employees = getEmployees().filter(e => e.id !== id)
  saveEmployees(employees)
}

// Payroll Runs (finalized months)
export const getPayrollRuns = () => get(KEYS.PAYROLL_RUNS) || []
export const savePayrollRuns = (runs) => set(KEYS.PAYROLL_RUNS, runs)
export const getPayrollRun = (companyId, month, year) => {
  const runs = getPayrollRuns()
  return runs.find(r => r.companyId === companyId && r.month === month && r.year === year)
}
export const finalizePayroll = (companyId, month, year, payrollData) => {
  const runs = getPayrollRuns()
  const existing = runs.findIndex(r => r.companyId === companyId && r.month === month && r.year === year)
  const run = {
    id: crypto.randomUUID(),
    companyId,
    month,
    year,
    finalizedAt: new Date().toISOString(),
    payrollData,
  }
  if (existing >= 0) {
    runs[existing] = run
  } else {
    runs.push(run)
  }
  savePayrollRuns(runs)
  return run
}
export const unfinalizePayroll = (companyId, month, year) => {
  const runs = getPayrollRuns().filter(
    r => !(r.companyId === companyId && r.month === month && r.year === year)
  )
  savePayrollRuns(runs)
}

// Monthly overrides (LOP, bonus per employee per month)
export const getPayrollOverrides = () => get(KEYS.PAYROLL_OVERRIDES) || {}
export const savePayrollOverrides = (overrides) => set(KEYS.PAYROLL_OVERRIDES, overrides)
export const getMonthlyOverride = (companyId, month, year, employeeId) => {
  const key = `${companyId}_${year}_${month}`
  const overrides = getPayrollOverrides()
  return (overrides[key] || {})[employeeId] || {}
}
export const saveMonthlyOverride = (companyId, month, year, employeeId, data) => {
  const key = `${companyId}_${year}_${month}`
  const overrides = getPayrollOverrides()
  if (!overrides[key]) overrides[key] = {}
  overrides[key][employeeId] = { ...(overrides[key][employeeId] || {}), ...data }
  savePayrollOverrides(overrides)
}
export const getMonthlyOverrides = (companyId, month, year) => {
  const key = `${companyId}_${year}_${month}`
  const overrides = getPayrollOverrides()
  return overrides[key] || {}
}

export const isInitialized = () => !!get(KEYS.INITIALIZED)
export const markInitialized = () => set(KEYS.INITIALIZED, true)
