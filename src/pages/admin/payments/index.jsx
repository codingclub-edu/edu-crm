import React, { useState, useEffect } from 'react'
import {
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getAllPaymentTypes,
  createPaymentType,
  updatePaymentType,
  deletePaymentType,
  getMonthlyReport,
  getDailyPaymentReport,
  getPaymentReport
} from '../../../api/payments'

const PaymentsPage = () => {
  // ─── State ─────────────────────────────────────────────────────
  const [payments, setPayments] = useState([])
  const [paymentTypes, setPaymentTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [editingType, setEditingType] = useState(null)
  const [activeTab, setActiveTab] = useState('payments')
  const [report, setReport] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    typeId: '',
    dk: ''
  })

  // Form data
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
    toWho: '',
    date: new Date().toISOString().slice(0, 10),
    comment: ''
  })

  // Type form data
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    code: '',
    dk: 'credit',
    description: '',
    isActive: true
  })

  // ─── Load Data ──────────────────────────────────────────────────
  const loadPayments = async () => {
    setLoading(true)
    try {
      const res = await getAllPayments(filters)
      setPayments(res.data.data || res.data || [])
    } catch (err) {
      console.error('To\'lovlar yuklanmadi:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentTypes = async () => {
    try {
      const res = await getAllPaymentTypes({ activeOnly: false })
      setPaymentTypes(res.data.data || res.data || [])
    } catch (err) {
      console.error('To\'lov turlari yuklanmadi:', err)
    }
  }

  const loadReport = async (type = 'daily', date = new Date().toISOString().slice(0, 10)) => {
    try {
      let res
      if (type === 'monthly') {
        const month = new Date().toISOString().slice(0, 7)
        res = await getMonthlyReport(month)
      } else {
        res = await getDailyPaymentReport(date)
      }
      setReport(res.data)
    } catch (err) {
      console.error('Hisobot yuklanmadi:', err)
    }
  }

  useEffect(() => {
    loadPayments()
    loadPaymentTypes()
    if (activeTab === 'reports') loadReport()
  }, [filters, activeTab])

  // ─── Handlers ───────────────────────────────────────────────────
  const handleAddPayment = () => {
    setEditingPayment(null)
    setFormData({
      type: '',
      amount: '',
      month: new Date().toISOString().slice(0, 7),
      toWho: '',
      date: new Date().toISOString().slice(0, 10),
      comment: ''
    })
    setShowModal(true)
  }

  const handleEditPayment = (payment) => {
    setEditingPayment(payment)
    setFormData({
      type: payment.type || '',
      amount: payment.amount || '',
      month: payment.month || new Date().toISOString().slice(0, 7),
      toWho: payment.toWho || '',
      date: payment.date || new Date().toISOString().slice(0, 10),
      comment: payment.comment || ''
    })
    setShowModal(true)
  }

  const handleDeletePayment = async (id) => {
    if (!window.confirm('To\'lovni o\'chirishni tasdiqlaysizmi?')) return
    try {
      await deletePayment(id)
      loadPayments()
    } catch (err) {
      console.error('O\'chirish xatolik:', err)
    }
  }

  const handleSavePayment = async () => {
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, formData)
      } else {
        await createPayment(formData)
      }
      setShowModal(false)
      loadPayments()
    } catch (err) {
      console.error('Saqlash xatolik:', err)
    }
  }

  // ─── Type Handlers ──────────────────────────────────────────────
  const handleAddType = () => {
    setEditingType(null)
    setTypeFormData({
      name: '',
      code: '',
      dk: 'credit',
      description: '',
      isActive: true
    })
    setShowTypeModal(true)
  }

  const handleEditType = (type) => {
    setEditingType(type)
    setTypeFormData({
      name: type.name || '',
      code: type.code || '',
      dk: type.dk || 'credit',
      description: type.description || '',
      isActive: type.isActive ?? true
    })
    setShowTypeModal(true)
  }

  const handleDeleteType = async (id) => {
    if (!window.confirm('To\'lov turini o\'chirishni tasdiqlaysizmi?')) return
    try {
      await deletePaymentType(id)
      loadPaymentTypes()
    } catch (err) {
      console.error('O\'chirish xatolik:', err)
    }
  }

  const handleSaveType = async () => {
    try {
      if (editingType) {
        await updatePaymentType(editingType.id, typeFormData)
      } else {
        await createPaymentType(typeFormData)
      }
      setShowTypeModal(false)
      loadPaymentTypes()
    } catch (err) {
      console.error('Saqlash xatolik:', err)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">To'lovlar Boshqaruvi</h1>
        <p className="text-gray-600 mt-2">To'lovlar, to'lov turlari va hisobotlar</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['payments', 'types', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'payments' ? 'To\'lovlar' : tab === 'types' ? 'To\'lov Turlari' : 'Hisobotlar'}
          </button>
        ))}
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish sanasi</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tugash sanasi</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To'lov turi</label>
                <select
                  value={filters.typeId}
                  onChange={(e) => setFilters({ ...filters, typeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Barchasi</option>
                  {paymentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turi (DK)</label>
                <select
                  value={filters.dk}
                  onChange={(e) => setFilters({ ...filters, dk: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Barchasi</option>
                  <option value="credit">Kredit (Kirim)</option>
                  <option value="debit">Debit (Chiqim)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="mb-4">
            <button
              onClick={handleAddPayment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Yangi To'lov
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sana</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kim uchun</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Izoh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-4 text-center">Yuklanmoqda...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">To'lovlar yo'q</td></tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        {Number(payment.amount).toLocaleString()} so'm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.toWho}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.comment}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Types Tab */}
      {activeTab === 'types' && (
        <div>
          <div className="mb-4">
            <button
              onClick={handleAddType}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Yangi To'lov Turi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentTypes.map((type) => (
              <div
                key={type.id}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                  type.dk === 'credit' ? 'border-green-500' : 'border-red-500'
                } ${!type.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{type.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    type.dk === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {type.dk}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Kod: {type.code}</p>
                {type.description && (
                  <p className="text-sm text-gray-500 mb-3">{type.description}</p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditType(type)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDeleteType(type.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => loadReport('daily')}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-2">Kunlik Hisobot</h3>
              <p className="text-sm text-gray-600">Bugungi to'lovlar xulosasi</p>
            </button>
            <button
              onClick={() => loadReport('monthly')}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-2">Oylik Hisobot</h3>
              <p className="text-sm text-gray-600">Joriy oy to'lovlar xulosasi</p>
            </button>
          </div>

          {report && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Hisobot Natijalari</h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingPayment ? 'To\'lovni Tahrirlash' : 'Yangi To\'lov'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To'lov turi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Tanlang</option>
                  {paymentTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summa</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oy</label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kim uchun</label>
                <input
                  type="text"
                  value={formData.toWho}
                  onChange={(e) => setFormData({ ...formData, toWho: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSavePayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingType ? 'To\'lov Turini Tahrirlash' : 'Yangi To\'lov Turi'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomi</label>
                <input
                  type="text"
                  value={typeFormData.name}
                  onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kod</label>
                <input
                  type="text"
                  value={typeFormData.code}
                  onChange={(e) => setTypeFormData({ ...typeFormData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turi (DK)</label>
                <select
                  value={typeFormData.dk}
                  onChange={(e) => setTypeFormData({ ...typeFormData, dk: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="credit">Kredit (Kirim)</option>
                  <option value="debit">Debit (Chiqim)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
                <textarea
                  value={typeFormData.description}
                  onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              {editingType && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={typeFormData.isActive}
                    onChange={(e) => setTypeFormData({ ...typeFormData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">Faol</label>
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveType}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowTypeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsPage
