// Indian currency formatting
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0'
  const num = Math.round(Number(amount))
  if (num < 0) return '-₹' + formatCurrency(-num).replace('₹', '')
  const s = num.toString()
  if (s.length <= 3) return '₹' + s
  // Indian numbering: last 3 digits, then groups of 2
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const groups = []
  for (let i = rest.length; i > 0; i -= 2) {
    groups.unshift(rest.slice(Math.max(0, i - 2), i))
  }
  return '₹' + (groups.length ? groups.join(',') + ',' : '') + last3
}

export const formatCurrencyShort = (amount) => {
  const num = Math.abs(Number(amount) || 0)
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + 'Cr'
  if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + 'L'
  if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'K'
  return formatCurrency(num)
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatMonth = (month, year) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[month - 1]} ${year}`
}

export const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return months[month - 1]
}

export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export const currentFY = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return month >= 4 ? year : year - 1
}

export const getFYMonths = (fy) => {
  // FY starts April of fy and ends March of fy+1
  const months = []
  for (let m = 4; m <= 12; m++) {
    months.push({ month: m, year: fy })
  }
  for (let m = 1; m <= 3; m++) {
    months.push({ month: m, year: fy + 1 })
  }
  return months
}
