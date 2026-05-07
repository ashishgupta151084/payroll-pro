import jsPDF from 'jspdf'
import { formatCurrency, formatMonth, formatDate } from './formatters.js'

export const generatePayslipPDF = (payslipData, employee, company) => {
  const { month, year, basic, hra, conveyance, medical, lta, cca, grossSalary,
    coolOff, mobile, healthInsurance, bonus, totalVariable, ctc,
    pf, tds, totalDeductions, netSalary, lopDays } = payslipData

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  // Color palette
  const indigo = [79, 70, 229]
  const gray = [107, 114, 128]
  const lightGray = [243, 244, 246]
  const darkGray = [31, 41, 55]
  const white = [255, 255, 255]
  const green = [16, 185, 129]

  // Header background
  doc.setFillColor(...indigo)
  doc.rect(0, 0, pageWidth, 40, 'F')

  // Company name
  doc.setTextColor(...white)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(company?.name || 'Company Name', margin, 16)

  // Payslip title
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Payslip for ${formatMonth(month, year)}`, margin, 26)

  if (company?.address) {
    doc.setFontSize(8)
    doc.text(company.address, margin, 34)
  }

  // PAN/TAN on right
  if (company?.pan) {
    doc.setFontSize(8)
    doc.text(`PAN: ${company.pan}`, pageWidth - margin - 60, 20, { align: 'left' })
  }
  if (company?.tan) {
    doc.setFontSize(8)
    doc.text(`TAN: ${company.tan}`, pageWidth - margin - 60, 28, { align: 'left' })
  }

  // Employee details box
  let y = 50
  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, 'F')
  doc.setTextColor(...darkGray)

  const col1 = margin + 5
  const col2 = margin + 90

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('EMPLOYEE DETAILS', col1, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...darkGray)
  doc.text(`Name: ${employee?.name || ''}`, col1, y + 16)
  doc.text(`Code: ${employee?.employeeCode || ''}`, col1, y + 24)
  doc.text(`Designation: ${employee?.designation || ''}`, col2, y + 16)
  doc.text(`Department: ${employee?.department || ''}`, col2, y + 24)

  const col3 = margin + (pageWidth - 2 * margin) * 0.65
  doc.text(`DOJ: ${formatDate(employee?.dateOfJoining)}`, col3, y + 16)
  doc.text(`PAN: ${employee?.pan || ''}`, col3, y + 24)

  // Earnings & Deductions tables
  y += 40

  const tableWidth = (pageWidth - 2 * margin - 10) / 2
  const earningsX = margin
  const deductionsX = margin + tableWidth + 10

  // Table headers
  const drawTableHeader = (x, label) => {
    doc.setFillColor(...indigo)
    doc.rect(x, y, tableWidth, 8, 'F')
    doc.setTextColor(...white)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(label, x + 3, y + 5.5)
    doc.text('Amount', x + tableWidth - 3, y + 5.5, { align: 'right' })
  }

  drawTableHeader(earningsX, 'EARNINGS')
  drawTableHeader(deductionsX, 'DEDUCTIONS')

  y += 8

  const drawRow = (x, label, amount, isGray = false, isBold = false) => {
    if (isGray) {
      doc.setFillColor(...lightGray)
      doc.rect(x, y - 1, tableWidth, 7, 'F')
    }
    doc.setTextColor(...darkGray)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.text(label, x + 3, y + 4.5)
    doc.text(formatCurrency(amount), x + tableWidth - 3, y + 4.5, { align: 'right' })
    y += 7
  }

  // Earnings rows
  const startY = y
  const earningsRows = [
    ['Basic Salary', basic],
    ['HRA', hra],
    ['Conveyance Allowance', conveyance],
    ['Medical Reimbursement', medical],
    ['LTA', lta],
    ['CCA', cca],
  ]
  if (lopDays > 0) earningsRows.push([`LOP (${lopDays} days)`, -Math.round(payslipData.lop || 0)])
  earningsRows.push(['Cool Off Reimbursement', coolOff])
  earningsRows.push(['Mobile & Internet', mobile])
  if (healthInsurance) earningsRows.push(['Health Insurance', healthInsurance])
  if (bonus) earningsRows.push(['Bonus', bonus])

  earningsRows.forEach(([label, amount], i) => drawRow(earningsX, label, amount, i % 2 === 1))

  // Draw a line
  doc.setDrawColor(209, 213, 219)
  doc.line(earningsX, y, earningsX + tableWidth, y)
  y += 2
  drawRow(earningsX, 'Gross + Variable (CTC)', ctc, false, true)

  const earningsEndY = y

  // Deductions - reset y to startY
  y = startY
  const deductionRows = [
    ['Provident Fund (PF)', pf],
    ['Income Tax (TDS)', tds],
  ]
  deductionRows.forEach(([label, amount], i) => drawRow(deductionsX, label, amount, i % 2 === 1))

  // Pad deductions table to same height as earnings
  while (y < earningsEndY - 9) {
    y += 7
  }

  doc.setDrawColor(209, 213, 219)
  doc.line(deductionsX, y, deductionsX + tableWidth, y)
  y += 2
  drawRow(deductionsX, 'Total Deductions', totalDeductions, false, true)

  // Net Pay box
  y = Math.max(earningsEndY, y) + 8
  doc.setFillColor(...green)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 14, 3, 3, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('NET SALARY (Take Home)', margin + 5, y + 9)
  doc.text(formatCurrency(netSalary), pageWidth - margin - 5, y + 9, { align: 'right' })

  // Net salary in words
  y += 20
  doc.setTextColor(...gray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(`Net Salary in Words: ${numberToWords(Math.round(netSalary))} Only`, margin, y)

  // Footer
  y += 12
  doc.setDrawColor(209, 213, 219)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6
  doc.setTextColor(...gray)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('This is a computer generated payslip and does not require a signature.', margin, y)
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, y, { align: 'right' })

  doc.save(`Payslip_${employee?.name?.replace(/\s/g, '_')}_${formatMonth(month, year).replace(' ', '_')}.pdf`)
}

// Number to words (Indian style)
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

const numToWords = (n) => {
  if (n === 0) return ''
  if (n < 20) return ones[n] + ' '
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' '
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + numToWords(n % 100)
  return ''
}

export const numberToWords = (n) => {
  if (n === 0) return 'Zero Rupees'
  let result = ''
  if (n >= 10000000) {
    result += numToWords(Math.floor(n / 10000000)) + 'Crore '
    n %= 10000000
  }
  if (n >= 100000) {
    result += numToWords(Math.floor(n / 100000)) + 'Lakh '
    n %= 100000
  }
  if (n >= 1000) {
    result += numToWords(Math.floor(n / 1000)) + 'Thousand '
    n %= 1000
  }
  result += numToWords(n)
  return ('Rupees ' + result.trim()).replace(/\s+/g, ' ')
}
