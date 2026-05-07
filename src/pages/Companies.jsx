import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Trash2, MapPin, CreditCard } from 'lucide-react'
import Modal from '../components/Modal'
import { getCompanies, addCompany, updateCompany, deleteCompany } from '../utils/storage'

const emptyForm = {
  name: '', address: '', pan: '', tan: '', gstin: '', state: ''
}

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const reload = () => setCompanies(getCompanies())
  useEffect(() => { reload() }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (company) => {
    setEditingId(company.id)
    setForm({
      name: company.name || '',
      address: company.address || '',
      pan: company.pan || '',
      tan: company.tan || '',
      gstin: company.gstin || '',
      state: company.state || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateCompany(editingId, form)
    } else {
      addCompany(form)
    }
    setModalOpen(false)
    reload()
  }

  const handleDelete = (id) => {
    deleteCompany(id)
    setDeleteConfirm(null)
    reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Companies</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your company entities</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(company => (
          <div key={company.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {company.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{company.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{company.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(company)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(company.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {company.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>{company.address}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { label: 'PAN', value: company.pan },
                  { label: 'TAN', value: company.tan },
                  { label: 'GSTIN', value: company.gstin },
                ].map(({ label, value }) => value && (
                  <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-500 font-medium">{label}</div>
                    <div className="text-sm font-mono text-gray-800 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <Building2 size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No companies yet</p>
            <p className="text-sm">Click "Add Company" to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Company' : 'Add Company'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Celebal Technologies Pvt Ltd"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Registered office address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
              <input
                className="input-field font-mono uppercase"
                value={form.pan}
                onChange={e => setForm(f => ({ ...f, pan: e.target.value.toUpperCase() }))}
                placeholder="AABCC1234D"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TAN</label>
              <input
                className="input-field font-mono uppercase"
                value={form.tan}
                onChange={e => setForm(f => ({ ...f, tan: e.target.value.toUpperCase() }))}
                placeholder="PNEC12345A"
                maxLength={10}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                className="input-field font-mono uppercase"
                value={form.gstin}
                onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                placeholder="27AABCC1234D1ZQ"
                maxLength={15}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                className="input-field"
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                placeholder="Maharashtra"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Save Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Company"
        size="sm"
      >
        <div className="text-center py-4">
          <Trash2 size={40} className="mx-auto text-red-400 mb-3" />
          <p className="text-gray-700 font-medium">Are you sure you want to delete this company?</p>
          <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
