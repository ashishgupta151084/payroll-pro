// Indian Tax Calculation Engine - FY 2025-26

// Old Regime Tax Slabs
const OLD_SLABS = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 500000, rate: 0.05 },
  { from: 500000, to: 1000000, rate: 0.20 },
  { from: 1000000, to: Infinity, rate: 0.30 },
]

// New/Concessional Regime Tax Slabs FY 2025-26
const NEW_SLABS = [
  { from: 0, to: 400000, rate: 0 },
  { from: 400000, to: 800000, rate: 0.05 },
  { from: 800000, to: 1200000, rate: 0.10 },
  { from: 1200000, to: 1600000, rate: 0.15 },
  { from: 1600000, to: 2000000, rate: 0.20 },
  { from: 2000000, to: 2400000, rate: 0.25 },
  { from: 2400000, to: Infinity, rate: 0.30 },
]

const calculateSlabTax = (income, slabs) => {
  let tax = 0
  for (const slab of slabs) {
    if (income <= slab.from) break
    const taxableInSlab = Math.min(income, slab.to) - slab.from
    tax += taxableInSlab * slab.rate
  }
  return Math.max(0, tax)
}

const calculateSurcharge = (income, tax) => {
  if (income <= 5000000) return 0
  if (income <= 10000000) return tax * 0.10
  if (income <= 20000000) return tax * 0.15
  if (income <= 50000000) return tax * 0.25
  return tax * 0.37
}

// HRA Exemption calculation
export const calculateHRAExemption = (employee, annualData) => {
  const { basic, hra, cityType } = annualData
  const { rentPaid = 0 } = employee.declarations || {}

  if (!rentPaid || rentPaid <= 0) return 0

  const percentOfBasic = cityType === 'metro' ? 0.50 : 0.40
  const condition1 = hra // Actual HRA received
  const condition2 = basic * percentOfBasic // 50%/40% of Basic
  const condition3 = Math.max(0, rentPaid - basic * 0.10) // Rent paid - 10% of Basic

  return Math.min(condition1, condition2, condition3)
}

// Determine active months in FY for a mid-year joiner (FY runs Apr–Mar)
export const getActiveMonthsInFY = (employee, fyYear) => {
  if (!employee.dateOfJoining) return 12
  const doj = new Date(employee.dateOfJoining)
  const fyStart = new Date(fyYear, 3, 1)   // April 1 of FY start year
  const fyEnd = new Date(fyYear + 1, 2, 31) // March 31 of FY end year
  if (doj > fyEnd) return 0
  if (doj <= fyStart) return 12
  // Count months from DOJ month to March (inclusive)
  // doj.getMonth() 0-indexed: April=3, July=6, ...
  const joinMonth = doj.getMonth() // 0-indexed
  const marchMonth = 2             // March 0-indexed of next calendar year
  // Months = (12 - joinMonth) in this calendar year if joinMonth >= 3(April)
  if (joinMonth >= 3) {
    return 12 - joinMonth + 3  // from joinMonth to Dec + Jan-Mar
  }
  // If joined Jan-Mar of the FY end year
  return marchMonth - joinMonth + 1
}

// Main tax calculation function
export const calculateAnnualTax = (employee, fyYear) => {
  const sal = employee.salary || {}
  const decl = employee.declarations || {}
  const cityType = employee.cityType || 'non-metro'

  // Determine FY year (default current FY 2025-26 → fyYear = 2025)
  const fy = fyYear || 2025

  // Active months — for mid-year joiners salary is earned only for those months
  const activeMonths = getActiveMonthsInFY(employee, fy)

  // Annual salary components (prorated for mid-year joiners)
  const annualBasic = (sal.basic || 0) * activeMonths
  const annualHRA = (sal.hra || 0) * activeMonths
  const annualConveyance = (sal.conveyance || 0) * activeMonths
  const annualMedical = (sal.medical || 0) * activeMonths
  const annualLTA = (sal.lta || 0) * activeMonths
  const annualCCA = (sal.cca || 0) * activeMonths
  const annualCoolOff = (sal.coolOff || 0) * activeMonths
  const annualMobile = (sal.mobile || 0) * activeMonths
  const annualHealthIns = (sal.healthInsurance || 0) * activeMonths
  const annualBonus = sal.annualBonus || 0

  // PF: use annualPFOverride if present (e.g. Jahid), noPF if flagged, else standard cap
  let annualPF
  if (sal.noPF) {
    annualPF = 0
  } else if (sal.annualPFOverride != null) {
    annualPF = sal.annualPFOverride
  } else {
    annualPF = Math.min((sal.basic || 0) * 0.12, 1800) * activeMonths
  }

  // Annual Gross = sum of fixed components
  const annualGross = annualBasic + annualHRA + annualConveyance + annualMedical + annualLTA + annualCCA
  const annualVariable = annualCoolOff + annualMobile + annualHealthIns + annualBonus
  const annualCTC = annualGross + annualVariable

  // ---- OLD REGIME ----
  // Standard Deduction
  const oldStdDeduction = 50000

  // HRA Exemption
  const hraExemption = calculateHRAExemption(employee, {
    basic: annualBasic,
    hra: annualHRA,
    cityType,
  })

  // LTA Exemption
  const ltaExemption = Math.min(annualLTA, decl.ltaClaimedActual || 0)

  // Conveyance & Medical are fully exempt in old regime
  const conveyanceExemption = annualConveyance
  const medicalExemption = annualMedical

  // 80C deductions (max 1,50,000)
  const c80 = Math.min(
    (decl.lic || 0) + (decl.ppf || 0) + (decl.tuitionFees || 0) +
    (decl.housingLoanPrincipal || 0) + (decl.taxSaverFD || 0) +
    (decl.elss || 0) + annualPF,
    150000
  )

  // 80D Medical Insurance (max 25000 self, 50000 senior citizen)
  const c80D = Math.min(decl.medicalInsurance || 0, decl.isSeniorCitizen ? 50000 : 25000)

  // 80E Education Loan Interest (no limit)
  const c80E = decl.educationLoanInterest || 0

  // 24b Housing Loan Interest (max 2,00,000 self-occupied)
  const c24b = Math.min(decl.housingLoanInterest || 0, 200000)

  // Old regime taxable income
  const oldGrossIncome = annualCTC
  const oldExemptions = hraExemption + ltaExemption + conveyanceExemption + medicalExemption
  const oldDeductions = oldStdDeduction + c80 + c80D + c80E + c24b
  const oldTaxableIncome = Math.max(0, oldGrossIncome - oldExemptions - oldDeductions)

  // Old regime tax calculation
  let oldBaseTax = calculateSlabTax(oldTaxableIncome, OLD_SLABS)

  // Rebate 87A for old regime (if taxable income <= 5,00,000, rebate up to 12,500)
  if (oldTaxableIncome <= 500000) {
    oldBaseTax = Math.max(0, oldBaseTax - Math.min(oldBaseTax, 12500))
  }

  const oldSurcharge = calculateSurcharge(oldTaxableIncome, oldBaseTax)
  const oldTaxAfterSurcharge = oldBaseTax + oldSurcharge
  const oldCess = oldTaxAfterSurcharge * 0.04
  const oldTotalTax = Math.round(oldTaxAfterSurcharge + oldCess)
  const oldMonthlyTDS = Math.round(oldTotalTax / 12)

  // ---- NEW REGIME ----
  const newStdDeduction = 75000
  const newTaxableIncome = Math.max(0, annualCTC - newStdDeduction)

  let newBaseTax = calculateSlabTax(newTaxableIncome, NEW_SLABS)

  // Rebate 87A for new regime (if taxable income <= 12,00,000, rebate = full tax)
  if (newTaxableIncome <= 1200000) {
    newBaseTax = 0
  } else {
    // Marginal Relief (Finance Act 2025): tax cannot exceed the amount by which
    // income exceeds ₹12L. Prevents a cliff-edge jump for incomes just above ₹12L.
    // Applies in the TI range ₹12,00,001 – ₹12,75,000 (approx).
    const marginalRelief = Math.max(0, newBaseTax - (newTaxableIncome - 1200000))
    newBaseTax = newBaseTax - marginalRelief
  }

  const newSurcharge = calculateSurcharge(newTaxableIncome, newBaseTax)
  const newTaxAfterSurcharge = newBaseTax + newSurcharge
  const newCess = newTaxAfterSurcharge * 0.04
  const newTotalTax = Math.round(newTaxAfterSurcharge + newCess)
  const newMonthlyTDS = Math.round(newTotalTax / 12)

  const regime = employee.taxRegime || 'new'
  const applicableTax = regime === 'old' ? oldTotalTax : newTotalTax
  const applicableMonthlyTDS = regime === 'old' ? oldMonthlyTDS : newMonthlyTDS

  return {
    annualCTC,
    annualGross,
    annualVariable,
    annualPF,
    activeMonths,

    // Old regime
    old: {
      grossIncome: oldGrossIncome,
      hraExemption,
      ltaExemption,
      conveyanceExemption,
      medicalExemption,
      totalExemptions: oldExemptions,
      stdDeduction: oldStdDeduction,
      c80,
      c80D,
      c80E,
      c24b,
      totalDeductions: oldDeductions,
      taxableIncome: oldTaxableIncome,
      baseTax: oldBaseTax,
      surcharge: oldSurcharge,
      cess: Math.round(oldCess),
      totalTax: oldTotalTax,
      monthlyTDS: oldMonthlyTDS,
    },

    // New regime
    new: {
      grossIncome: annualCTC,
      stdDeduction: newStdDeduction,
      taxableIncome: newTaxableIncome,
      baseTax: newBaseTax,
      surcharge: newSurcharge,
      cess: Math.round(newCess),
      totalTax: newTotalTax,
      monthlyTDS: newMonthlyTDS,
    },

    // Applicable based on employee's chosen regime
    applicableTax,
    applicableMonthlyTDS,
    betterRegime: oldTotalTax <= newTotalTax ? 'old' : 'new',
    regime,
  }
}

// Calculate monthly TDS considering months elapsed in the financial year
export const calculateMonthlyTDS = (employee, currentMonth, currentYear) => {
  const taxData = calculateAnnualTax(employee)
  const annualTax = taxData.applicableTax

  // Determine FY
  const fy = currentMonth >= 4 ? currentYear : currentYear - 1

  // Months remaining in FY (including current month)
  // FY runs Apr to Mar
  let fyStartMonth = 4
  let fyStartYear = fy

  // Calculate month index from Apr=1 to Mar=12
  const getMonthIndex = (m, y) => {
    if (y === fyStartYear) return m - fyStartMonth + 1
    return 12 - fyStartMonth + 1 + m
  }

  const currentMonthIndex = getMonthIndex(currentMonth, currentYear)
  const remainingMonths = Math.max(1, 13 - currentMonthIndex)

  // Simple equal distribution
  return Math.round(annualTax / 12)
}
