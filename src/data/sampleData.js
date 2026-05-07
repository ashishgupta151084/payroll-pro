// Pre-loaded sample data from Excel sheet

export const sampleCompanies = [
  {
    id: 'comp-celebal-001',
    name: 'Celebal Technologies Pvt Ltd',
    address: '14th Floor, Godrej IT Park, Pune - 411014, Maharashtra',
    pan: 'AABCC1234D',
    tan: 'PNEC12345A',
    gstin: '27AABCC1234D1ZQ',
    state: 'Maharashtra',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp-demo-002',
    name: 'Demo Infosystems Ltd',
    address: '5th Floor, DLF Cyber City, Gurugram - 122002, Haryana',
    pan: 'AADCD5678E',
    tan: 'DELM67890B',
    gstin: '06AADCD5678E1ZP',
    state: 'Haryana',
    createdAt: new Date().toISOString(),
  },
]

export const sampleEmployees = [
  // --- Celebal Technologies ---
  {
    id: 'emp-001',
    companyId: 'comp-celebal-001',
    name: 'Kamna Singh',
    employeeCode: 'CEL001',
    designation: 'Software Engineer',
    department: 'Engineering',
    dateOfJoining: '2022-06-01',
    taxRegime: 'new',
    cityType: 'metro',
    pan: 'ABCKS1234A',
    aadhar: '1234 5678 9012',
    bankAccount: '001234567890',
    ifsc: 'HDFC0001234',
    salary: {
      basic: 30285,
      hra: 12114,
      conveyance: 0,       // Excel: 0
      medical: 0,          // Excel: 0
      lta: 2500,
      cca: 22401,
      coolOff: 500,
      mobile: 0,           // Excel: 0
      healthInsurance: 0,  // Excel: 0
      monthlyBonus: 0,
      annualBonus: 0,
    },
    declarations: {
      rentPaid: 0,
      ltaClaimedActual: 0,
      lic: 0,
      ppf: 0,
      tuitionFees: 0,
      housingLoanPrincipal: 0,
      taxSaverFD: 0,
      elss: 0,
      medicalInsurance: 0,
      educationLoanInterest: 0,
      housingLoanInterest: 0,
      isSeniorCitizen: false,
    },
  },
  {
    id: 'emp-002',
    companyId: 'comp-celebal-001',
    name: 'Nitesh Singhal',
    employeeCode: 'CEL002',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    dateOfJoining: '2021-03-15',
    taxRegime: 'new',
    cityType: 'metro',
    pan: 'ABCNS5678B',
    aadhar: '2345 6789 0123',
    bankAccount: '002345678901',
    ifsc: 'ICIC0002345',
    salary: {
      basic: 36196,
      hra: 14478,
      conveyance: 0,        // Excel: 0
      medical: 0,           // Excel: 0
      lta: 2500,
      cca: 27261,
      coolOff: 500,
      mobile: 0,            // Excel: 0
      healthInsurance: 0,   // Excel: 0
      monthlyBonus: 0,
      annualBonus: 0,
    },
    declarations: {
      rentPaid: 0,
      ltaClaimedActual: 0,
      lic: 0,
      ppf: 0,
      tuitionFees: 0,
      housingLoanPrincipal: 0,
      taxSaverFD: 0,
      elss: 0,
      medicalInsurance: 0,
      educationLoanInterest: 0,
      housingLoanInterest: 0,
      isSeniorCitizen: false,
    },
  },
  {
    id: 'emp-003',
    companyId: 'comp-celebal-001',
    name: 'Bharat Sankhala',
    employeeCode: 'CEL003',
    designation: 'Lead Engineer',
    department: 'Engineering',
    dateOfJoining: '2020-09-01',
    taxRegime: 'new',
    cityType: 'metro',
    pan: 'ABCBS9012C',
    aadhar: '3456 7890 1234',
    bankAccount: '003456789012',
    ifsc: 'SBIN0003456',
    salary: {
      basic: 25050,
      hra: 10020,
      conveyance: 0,        // Excel: 0
      medical: 0,           // Excel: 0
      lta: 2500,
      cca: 18096,
      coolOff: 500,
      mobile: 0,            // Excel: 0
      healthInsurance: 0,   // Excel: 0
      monthlyBonus: 0,
      annualBonus: 44940, // April bonus
    },
    declarations: {
      rentPaid: 0,
      ltaClaimedActual: 0,
      lic: 0,
      ppf: 0,
      tuitionFees: 0,
      housingLoanPrincipal: 0,
      taxSaverFD: 0,
      elss: 0,
      medicalInsurance: 0,
      educationLoanInterest: 0,
      housingLoanInterest: 0,
      isSeniorCitizen: false,
    },
  },
  {
    id: 'emp-004',
    companyId: 'comp-celebal-001',
    name: 'Rani Pata',
    employeeCode: 'CEL004',
    designation: 'Engineering Manager',
    department: 'Engineering',
    dateOfJoining: '2019-01-10',
    taxRegime: 'new',
    cityType: 'metro',
    pan: 'ABCRP3456D',
    aadhar: '4567 8901 2345',
    bankAccount: '004567890123',
    ifsc: 'AXIS0004567',
    salary: {
      basic: 71581,
      hra: 28632,
      conveyance: 0,        // Excel: 0
      medical: 0,           // Excel: 0
      lta: 2500,
      cca: 56355,
      coolOff: 500,
      mobile: 0,            // Excel: 0
      healthInsurance: 0,   // Excel: 0
      monthlyBonus: 0,
      annualBonus: 158318,
    },
    declarations: {
      rentPaid: 0,
      ltaClaimedActual: 0,
      lic: 0,
      ppf: 0,
      tuitionFees: 0,
      housingLoanPrincipal: 0,
      taxSaverFD: 0,
      elss: 0,
      medicalInsurance: 0,
      educationLoanInterest: 0,
      housingLoanInterest: 0,
      isSeniorCitizen: false,
    },
  },
  {
    id: 'emp-005',
    companyId: 'comp-celebal-001',
    name: 'Jahid Khan',
    employeeCode: 'CEL005',
    designation: 'Product Manager',
    department: 'Product',
    dateOfJoining: '2021-07-01',
    taxRegime: 'old', // Opted OLD regime
    cityType: 'metro',
    pan: 'ABCJK7890E',
    aadhar: '5678 9012 3456',
    bankAccount: '005678901234',
    ifsc: 'KOTAK0005678',
    salary: {
      basic: 47025,
      hra: 18810,
      conveyance: 0,        // Excel: 0
      medical: 0,           // Excel: 0
      lta: 2500,
      cca: 36165,
      coolOff: 500,
      mobile: 0,            // Excel: 0
      healthInsurance: 0,   // Excel: 0
      monthlyBonus: 0,
      annualBonus: 0,
      // Excel shows PF at ₹9,800/month (May-Mar) + ₹1,800 (April) = ₹109,600/yr
      // This is because Jahid's PF is based on full basic (not capped at ₹15,000)
      annualPFOverride: 109600,
    },
    declarations: {
      rentPaid: 0,          // Excel: 0 (no HRA exemption claimed)
      ltaClaimedActual: 0,  // Excel: 0
      lic: 0,               // Excel: 0
      ppf: 0,               // Excel: 0
      tuitionFees: 0,
      housingLoanPrincipal: 0,
      taxSaverFD: 0,
      elss: 0,              // Excel: 0
      medicalInsurance: 0,  // Excel: 0
      educationLoanInterest: 0,
      housingLoanInterest: 0,
      isSeniorCitizen: false,
    },
  },
  {
    id: 'emp-006',
    companyId: 'comp-celebal-001',
    name: 'Renuka Godara',
    employeeCode: 'CEL006',
    designation: 'UI/UX Designer',
    department: 'Design',
    dateOfJoining: '2025-07-01', // Joined July 2025; active from July only (9 months in FY)
    taxRegime: 'new',
    cityType: 'metro',
    pan: 'ABCRS2345F',
    aadhar: '6789 0123 4567',
    bankAccount: '006789012345',
    ifsc: 'HDFC0006789',
    salary: {
      basic: 33750,           // Excel: ₹33,750/month
      hra: 13500,             // Excel: 40% of basic
      conveyance: 0,          // Excel: 0
      medical: 0,             // Excel: 0
      lta: 2500,
      cca: 25000,             // Excel: CCA component
      coolOff: 0,             // Excel: 0 (no cool-off for Renuka)
      mobile: 0,              // Excel: 0
      healthInsurance: 0,     // Excel: 0
      monthlyBonus: 0,
      annualBonus: 0,
      noPF: true,             // Excel: No PF deduction for Renuka
    },
    declarations: {
      rentPaid: 0,
      ltaClaimedActual: 0,
      lic: 0,
      ppf: 0,
      tuitionFees: 0,
      housingLoanPrincipal: 0,
      taxSaverFD: 0,
      elss: 0,
      medicalInsurance: 0,
      educationLoanInterest: 0,
      housingLoanInterest: 0,
      isSeniorCitizen: false,
    },
  },
  // --- Demo Infosystems ---
  {
    id: 'emp-007',
    companyId: 'comp-demo-002',
    name: 'Arun Mehta',
    employeeCode: 'DMO001',
    designation: 'Senior Developer',
    department: 'Technology',
    dateOfJoining: '2020-04-01',
    taxRegime: 'new',
    cityType: 'metro',
    pan: 'ABCAM4567G',
    aadhar: '7890 1234 5678',
    bankAccount: '007890123456',
    ifsc: 'HDFC0007890',
    salary: {
      basic: 55000,
      hra: 22000,
      conveyance: 1600,
      medical: 1250,
      lta: 2500,
      cca: 40000,
      coolOff: 500,
      mobile: 500,
      healthInsurance: 1000,
      monthlyBonus: 0,
      annualBonus: 0,
    },
    declarations: {
      rentPaid: 0,
      ltaClaimedActual: 0,
      lic: 0, ppf: 0, tuitionFees: 0, housingLoanPrincipal: 0,
      taxSaverFD: 0, elss: 0, medicalInsurance: 0,
      educationLoanInterest: 0, housingLoanInterest: 0, isSeniorCitizen: false,
    },
  },
  {
    id: 'emp-008',
    companyId: 'comp-demo-002',
    name: 'Priya Nair',
    employeeCode: 'DMO002',
    designation: 'Business Analyst',
    department: 'Operations',
    dateOfJoining: '2021-11-01',
    taxRegime: 'old',
    cityType: 'non-metro',
    pan: 'ABCPN8901H',
    aadhar: '8901 2345 6789',
    bankAccount: '008901234567',
    ifsc: 'ICIC0008901',
    salary: {
      basic: 40000,
      hra: 16000,
      conveyance: 1600,
      medical: 1250,
      lta: 2500,
      cca: 28000,
      coolOff: 500,
      mobile: 500,
      healthInsurance: 1000,
      monthlyBonus: 0,
      annualBonus: 0,
    },
    declarations: {
      rentPaid: 144000, // 12000/month
      ltaClaimedActual: 30000,
      lic: 50000,
      ppf: 60000,
      tuitionFees: 0,
      housingLoanPrincipal: 0,
      taxSaverFD: 0,
      elss: 0,
      medicalInsurance: 15000,
      educationLoanInterest: 0,
      housingLoanInterest: 0,
      isSeniorCitizen: false,
    },
  },
]
