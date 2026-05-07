import { calculateAnnualTax } from './taxUtils.js'

// Calculate monthly payroll for a single employee
export const calculateMonthlyPayroll = (employee, month, year, overrides = {}) => {
  const sal = employee.salary || {}
  const lop = overrides.lop || 0 // Loss of Pay days
  const bonusOverride = overrides.bonus !== undefined ? overrides.bonus : (sal.monthlyBonus || 0)

  // Working days assumption: 26 days/month for LOP calculation
  const workingDays = 26
  const lopDeduction = lop > 0 ? (calculateGross(sal) / workingDays) * lop : 0

  // Fixed components (monthly)
  const basic = sal.basic || 0
  const hra = sal.hra || 0
  const conveyance = sal.conveyance || 0
  const medical = sal.medical || 0
  const lta = sal.lta || 0
  const cca = sal.cca || 0

  // Gross = sum of fixed components - LOP
  const grossBeforeLOP = basic + hra + conveyance + medical + lta + cca
  const grossSalary = Math.round(grossBeforeLOP - lopDeduction)

  // Variable components
  const coolOff = sal.coolOff || 0
  const mobile = sal.mobile || 0
  const healthInsurance = sal.healthInsurance || 0
  const bonus = bonusOverride

  const totalVariable = coolOff + mobile + healthInsurance + bonus
  const ctc = grossSalary + totalVariable

  // Deductions
  // Respect noPF flag; for annualPFOverride employees use per-month override avg
  let pf
  if (sal.noPF) {
    pf = 0
  } else if (sal.annualPFOverride != null) {
    pf = Math.round(sal.annualPFOverride / 12)
  } else {
    pf = Math.min(Math.round(basic * 0.12), 1800)
  }

  // TDS - get from annual tax calculation
  const taxData = calculateAnnualTax(employee)
  const annualTax = taxData.applicableTax
  const activeMos = taxData.activeMonths || 12
  const monthlyTDS = Math.round(annualTax / activeMos)
  const educationCess = Math.round(monthlyTDS * 0.04 / 1.04) // Cess is already included in annualTax

  const totalDeductions = pf + monthlyTDS
  const netSalary = ctc - totalDeductions

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    month,
    year,
    // Earnings
    basic,
    hra,
    conveyance,
    medical,
    lta,
    cca,
    lop: lopDeduction,
    grossSalary,
    coolOff,
    mobile,
    healthInsurance,
    bonus,
    totalVariable,
    ctc,
    // Deductions
    pf,
    tds: monthlyTDS,
    totalDeductions,
    // Net
    netSalary,
    // Meta
    lopDays: lop,
    taxData,
  }
}

const calculateGross = (sal) => {
  return (sal.basic || 0) + (sal.hra || 0) + (sal.conveyance || 0) +
    (sal.medical || 0) + (sal.lta || 0) + (sal.cca || 0)
}

// Calculate payroll for all employees of a company for a given month
export const calculateCompanyPayroll = (employees, month, year, monthlyOverrides = {}) => {
  return employees.map(emp => {
    const overrides = monthlyOverrides[emp.id] || {}
    return calculateMonthlyPayroll(emp, month, year, overrides)
  })
}

// Aggregate payroll summary
export const aggregatePayroll = (payrollItems) => {
  return payrollItems.reduce((acc, item) => {
    acc.totalGross += item.grossSalary
    acc.totalCTC += item.ctc
    acc.totalPF += item.pf
    acc.totalTDS += item.tds
    acc.totalDeductions += item.totalDeductions
    acc.totalNet += item.netSalary
    acc.count += 1
    return acc
  }, {
    totalGross: 0,
    totalCTC: 0,
    totalPF: 0,
    totalTDS: 0,
    totalDeductions: 0,
    totalNet: 0,
    count: 0,
  })
}
