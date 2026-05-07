import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Plus, Pencil, Trash2, Search, Building2, Filter } from 'lucide-react'
import Modal from '../../components/Modal'
import { getEmployees, getCompanies, deleteEmployee } from '../../utils/storage'
import { formatDate } from '../../utils/formatters'

export default function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const navigate = useNavigate()

  const reload = () => {
    setEmployees(getEmployees())
    setCompanies(getCompanies())
  }
  useEffect(() => { reload() }, [])

  const filtered = employees.filter(emp => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeCode?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q)
    const matchCompany = !filterCompany || emp.companyId === filterCompany
    return matchSearch && matchCompany
  })

  const getCompanyName = (id) => companies.find(c => c.id === id)?.name || '-'

  const handleDelete = (id) => {
    deleteEmployee(id)
    setDeleteConfirm(null)
    reload()
  }

  const regimeBadge = (regime) => regime === 'old'
    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Old</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">New</span>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Employees</h2>
          <p className="text-sm text-gray-500 mt-0.5">{employees.length} employees across {companies.length} companies</p>
        </div>
        <Link to="/employees/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by name, code, designation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="input-field pl-9 pr-8 min-w-[200px]"
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header text-left">Employee</th>
                <th className="table-header text-left">Code</th>
                <th className="table-header text-left hidden md:table-cell">Company</th>
                <th className="table-header text-left hidden lg:table-cell">Department</th>
                <th className="table-header text-center hidden md:table-cell">Regime</th>
                <th className="table-header text-left hidden lg:table-cell">DOJ</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                        {emp.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-gray-700">{emp.employeeCode}</td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="text-xs text-gray-600">{getCompanyName(emp.companyId)}</span>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-600">{emp.department}</td>
                  <td className="table-cell text-center hidden md:table-cell">{regimeBadge(emp.taxRegime)}</td>
                  <td className="table-cell hidden lg:table-cell text-gray-600">{formatDate(emp.dateOfJoining)}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/employees/${emp.id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(emp.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Users size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No employees found</p>
                    {search && <p className="text-sm">Try a different search term</p>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Employee" size="sm">
        <div className="text-center py-4">
          <Trash2 size={40} className="mx-auto text-red-400 mb-3" />
          <p className="text-gray-700 font-medium">Delete this employee?</p>
          <p className="text-sm text-gray-500 mt-1">All their data will be permanently removed.</p>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
