import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import EmployeeList from './pages/Employees/EmployeeList'
import EmployeeForm from './pages/Employees/EmployeeForm'
import PayrollList from './pages/Payroll/PayrollList'
import PayrollRun from './pages/Payroll/PayrollRun'
import Payslip from './pages/Payslip'
import TaxSheet from './pages/TaxSheet'
import Reports from './pages/Reports'
import { isInitialized, markInitialized, saveCompanies, saveEmployees } from './utils/storage'
import { sampleCompanies, sampleEmployees } from './data/sampleData'

function AppInit() {
  useEffect(() => {
    if (!isInitialized()) {
      saveCompanies(sampleCompanies)
      saveEmployees(sampleEmployees)
      markInitialized()
    }
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/new" element={<EmployeeForm />} />
          <Route path="/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="/payroll" element={<PayrollList />} />
          <Route path="/payroll/run" element={<PayrollRun />} />
          <Route path="/payslip" element={<Payslip />} />
          <Route path="/taxsheet" element={<TaxSheet />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
