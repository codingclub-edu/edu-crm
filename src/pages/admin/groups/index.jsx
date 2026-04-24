import React, { useState, useEffect } from 'react'
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getGroupById
} from '../../../api/groups'
import { getAllTeachers } from '../../../api/teacher'
import { getAllCourses } from '../../../api/courses'

const GroupsPage = () => {
  // ─── State ─────────────────────────────────────────────────────
  const [groups, setGroups] = useState([])
  const [rooms, setRooms] = useState([])
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStudentsView, setShowStudentsView] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupStudents, setGroupStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState('group') // 'group' or 'room'
  const [activeTab, setActiveTab] = useState('groups')

  // Group form data
  const [formData, setFormData] = useState({
    name: '',
    courseId: null,
    teacherId: null,
    roomId: null,
    startDate: '',
    endDate: '',
    maxStudents: '',
    monthlyFeePerStudent: '',
    schedule: {
      days: [],
      fromHour: '',
      toHour: ''
    }
  })

  // Room form data
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    number: '',
    capacity: '',
    equipment: ''
  })

  // Search & pagination
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 9

  // ─── Load Data ──────────────────────────────────────────────────
  const loadGroups = async () => {
    setLoading(true)
    try {
      const res = await getAllGroups({ search })
      setGroups(res.data.data || res.data || [])
    } catch (err) {
      console.error('Guruhlar yuklanmadi:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRooms = async () => {
    try {
      const res = await getAllRooms()
      setRooms(res.data.data || res.data || [])
    } catch (err) {
      console.error('Xonalar yuklanmadi:', err)
    }
  }

  const loadTeachers = async () => {
    try {
      const res = await getAllTeachers()
      setTeachers(res.data.data || res.data || [])
    } catch (err) {
      console.error('O\'qituvchilar yuklanmadi:', err)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await getAllCourses()
      setCourses(res.data.data || res.data || [])
    } catch (err) {
      console.error('Kurslar yuklanmadi:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'groups') {
      loadGroups()
      loadTeachers()
      loadCourses()
      loadRooms()
    } else {
      loadRooms()
    }
  }, [activeTab, search])

  // ─── Group Handlers ─────────────────────────────────────────────
  const handleAddGroup = () => {
    setEditingGroup(null)
    setFormData({
      name: '',
      courseId: null,
      teacherId: null,
      roomId: null,
      startDate: '',
      endDate: '',
      maxStudents: '',
      monthlyFeePerStudent: '',
      schedule: {
        days: [],
        fromHour: '',
        toHour: ''
      }
    })
    setShowModal(true)
  }

  useEffect(() => {
    if (activeTab === 'groups') {
      loadTeachers()
      loadCourses()
      loadRooms()
    }
  }, [activeTab])

  const handleEditGroup = (group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name || '',
      courseId: group.courseId || '',
      teacherId: group.teacherId || '',
      roomId: group.roomId || '',
      startDate: group.startDate || '',
      endDate: group.endDate || '',
      maxStudents: group.maxStudents || '',
      monthlyFeePerStudent: group.monthlyFeePerStudent || '',
      schedule: group.schedule || {
        days: [],
        fromHour: '',
        toHour: ''
      }
    })
    setShowModal(true)
  }

  const handleDeleteGroup = (group) => {
    setItemToDelete(group)
    setDeleteType('group')
    setShowDeleteModal(true)
  }

  const handleDeleteRoom = (room) => {
    setItemToDelete(room)
    setDeleteType('room')
    setShowDeleteModal(true)
  }

  const handleViewStudents = async (group) => {
    setSelectedGroup(group)
    setShowStudentsView(true)
    setLoadingStudents(true)

    try {
      const res = await getGroupById(group.id, { includeStudents: true })
      const groupData = res.data.data || res.data

      let students = []

      if (groupData.students && Array.isArray(groupData.students)) {
        students = groupData.students
      } else if (groupData.studentsData && Array.isArray(groupData.studentsData)) {
        students = groupData.studentsData
      } else if (groupData.studentIds && Array.isArray(groupData.studentIds)) {
        students = groupData.studentIds.map(id => ({ id, name: 'O\'quvchi', phone: '—', balance: 0 }))
      } else if (groupData.students && typeof groupData.students === 'object') {
        students = Object.values(groupData.students)
      }

      if (students.length === 0 && group.students) {
        students = Array.isArray(group.students) ? group.students : [group.students]
      }

      setGroupStudents(students)
    } catch (err) {
      console.error('O\'quvchilarni yuklashda xatolik:', err)
      if (group.students) {
        const students = Array.isArray(group.students) ? group.students : [group.students]
        setGroupStudents(students)
      } else {
        setGroupStudents([])
      }
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleBackToGroups = () => {
    setShowStudentsView(false)
    setSelectedGroup(null)
    setGroupStudents([])
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      if (deleteType === 'group') {
        await deleteGroup(itemToDelete.id)
      } else {
        await deleteRoom(itemToDelete.id)
      }
      setShowDeleteModal(false)
      setItemToDelete(null)
      if (activeTab === 'groups') {
        loadGroups()
      } else {
        loadRooms()
      }
    } catch (err) {
      console.error('O\'chirish xatolik:', err)
    }
  }

  const handleSaveGroup = async () => {
    try {
      // Build data object - only include fields that have values
      const dataToSend = {
        name: formData.name,
      }

      // Add optional fields only if they have values
      if (formData.courseId) dataToSend.courseId = formData.courseId
      if (formData.teacherId) dataToSend.teacherId = formData.teacherId
      if (formData.roomId) dataToSend.roomId = formData.roomId
      if (formData.startDate) dataToSend.startDate = formData.startDate
      if (formData.endDate) dataToSend.endDate = formData.endDate
      if (formData.maxStudents) dataToSend.maxStudents = formData.maxStudents
      if (formData.monthlyFeePerStudent) dataToSend.monthlyFeePerStudent = formData.monthlyFeePerStudent

      // Only add schedule if at least one day is selected
      if (formData.schedule.days.length > 0) {
        dataToSend.schedule = {
          days: formData.schedule.days,
          fromHour: formData.schedule.fromHour,
          toHour: formData.schedule.toHour
        }
      }

      if (editingGroup) {
        await updateGroup(editingGroup.id, dataToSend)
      } else {
        await createGroup(dataToSend)
      }
      setShowModal(false)
      loadGroups()
    } catch (err) {
      console.error('Saqlash xatolik:', err)
      alert('Xatolik yuz berdi: ' + (err.response?.data?.error ?? err.message ?? "Noma'lum xatolik"))
    }
  }

  const handleDayToggle = (day) => {
    const newDays = formData.schedule.days.includes(day)
      ? formData.schedule.days.filter(d => d !== day)
      : [...formData.schedule.days, day]
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, days: newDays }
    })
  }

  // ─── Room Handlers ───────────────────────────────────────────────
  const handleAddRoom = () => {
    setEditingRoom(null)
    setRoomFormData({
      name: '',
      number: '',
      capacity: '',
      equipment: ''
    })
    setShowRoomModal(true)
  }

  const handleEditRoom = (room) => {
    setEditingRoom(room)
    setRoomFormData({
      name: room.name || '',
      number: room.number || '',
      capacity: room.capacity || '',
      equipment: room.equipment ? room.equipment.join(', ') : ''
    })
    setShowRoomModal(true)
  }

  const handleSaveRoom = async () => {
    try {
      const data = {
        ...roomFormData,
        equipment: roomFormData.equipment ? roomFormData.equipment.split(',').map(e => e.trim()) : []
      }
      if (editingRoom) {
        await updateRoom(editingRoom.id, data)
      } else {
        await createRoom(data)
      }
      setShowRoomModal(false)
      loadRooms()
    } catch (err) {
      console.error('Saqlash xatolik:', err)
      alert('Xatolik yuz berdi')
    }
  }

  // Helper functions
  const getGroupIcon = (name) => {
    const icons = [
      { emoji: '👥', bg: 'bg-purple-100', color: 'text-purple-600' },
      { emoji: '🎓', bg: 'bg-blue-100', color: 'text-blue-600' },
      { emoji: '💼', bg: 'bg-green-100', color: 'text-green-600' },
      { emoji: '🏫', bg: 'bg-orange-100', color: 'text-orange-600' },
      { emoji: '📚', bg: 'bg-pink-100', color: 'text-pink-600' },
      { emoji: '⭐', bg: 'bg-yellow-100', color: 'text-yellow-600' },
    ]
    return icons[name?.charCodeAt(0) % icons.length] ?? icons[0]
  }

  const getRoomIcon = (name) => {
    const icons = [
      { emoji: '🚪', bg: 'bg-indigo-100', color: 'text-indigo-600' },
      { emoji: '🏠', bg: 'bg-cyan-100', color: 'text-cyan-600' },
      { emoji: '🏢', bg: 'bg-teal-100', color: 'text-teal-600' },
      { emoji: '🏛️', bg: 'bg-amber-100', color: 'text-amber-600' },
    ]
    return icons[name?.charCodeAt(0) % icons.length] ?? icons[0]
  }

  // Pagination
  const getPaginatedItems = (items) => {
    return items.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    )
  }

  const paginatedGroups = getPaginatedItems(groups)
  const paginatedRooms = getPaginatedItems(rooms)
  const totalPages = activeTab === 'groups'
    ? Math.ceil(groups.length / itemsPerPage)
    : Math.ceil(rooms.length / itemsPerPage)

  // ─── Render ─────────────────────────────────────────────────────
  const days = ['Du', 'Se', 'Chor', 'Pa', 'Ju', 'Sha', 'Yak']

  // Show students view instead of groups
  if (showStudentsView && selectedGroup) {
    return (
      <div className="flex flex-col gap-6 p-1">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToGroups}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Orqaga
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedGroup.name} - O'quvchilar</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Jami: {groupStudents.length} ta o'quvchi
            </p>
          </div>
        </div>

        {/* Group Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Guruh</p>
            <p className="font-semibold text-gray-900">{selectedGroup.name}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">O'qituvchi</p>
            <p className="font-semibold text-gray-900">
              {teachers.find(t => t.id === selectedGroup.teacherId)?.name || '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kurs</p>
            <p className="font-semibold text-gray-900">
              {courses.find(c => c.id === selectedGroup.courseId)?.name || '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Xona</p>
            <p className="font-semibold text-gray-900">
              {rooms.find(r => r.id === selectedGroup.roomId)?.name || '—'}
            </p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loadingStudents ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Yuklanmoqda…</span>
              </div>
            </div>
          ) : groupStudents.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                <p className="text-sm font-medium text-gray-500">O'quvchilar yo'q</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="w-10">#</th>
                    <th>O'quvchi</th>
                    <th>Telefon</th>
                    <th>Parol</th>
                    <th className="text-right">Balans</th>
                    <th>Email</th>
                    <th>Mutaxassislik</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStudents.map((student, idx) => {
                    const balance = student.balance?.balance ?? student.balance ?? 0
                    return (
                      <tr key={student.id || student._id || idx} className="hover:bg-gray-50">
                        <td className="text-xs text-gray-400 font-mono">{idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                              {student.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
                            </div>
                            <span className="font-medium text-sm">{student.name}</span>
                          </div>
                        </td>
                        <td className="text-xs text-gray-600 font-mono">{student.phone}</td>
                        <td className="text-xs text-gray-600">••••••</td>
                        <td className="text-right">
                          <span className={`text-sm font-semibold ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Number(balance).toLocaleString()} so'm
                          </span>
                        </td>
                        <td className="text-xs text-gray-600">{student.email || '—'}</td>
                        <td className="text-xs text-gray-600">{student.specialization || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Group, Room, Delete modals still need to be accessible */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingGroup ? 'Guruhni Tahrirlash' : 'Yangi Guruh'}
                </h2>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Guruh nomi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Kurs <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    >
                      <option value="">Tanlang</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      O'qituvchi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    >
                      <option value="">Tanlang</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Xona <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    >
                      <option value="">Tanlang</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>{room.name} (#{room.number})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Boshlanish sanasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tugash sanasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Maksimal talabalar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Oylik to'lov (so'm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyFeePerStudent}
                      onChange={(e) => setFormData({ ...formData, monthlyFeePerStudent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dars kunlari</label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                          formData.schedule.days.includes(day)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Boshlanish vaqti</label>
                    <input
                      type="time"
                      value={formData.schedule.fromHour}
                      onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, fromHour: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tugash vaqti</label>
                    <input
                      type="time"
                      value={formData.schedule.toHour}
                      onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, toHour: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button onClick={handleSaveGroup} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">Saqlash</button>
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Bekor qilish</button>
              </div>
            </div>
          </div>
        )}

        {showRoomModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingRoom ? 'Xonani Tahrirlash' : 'Yangi Xona'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Xona nomi <span className="text-red-500">*</span></label>
                  <input type="text" value={roomFormData.name} onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Raqami <span className="text-red-500">*</span></label>
                  <input type="text" value={roomFormData.number} onChange={(e) => setRoomFormData({ ...roomFormData, number: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sig'imi <span className="text-red-500">*</span></label>
                  <input type="number" value={roomFormData.capacity} onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jihozlar (vergul bilan)</label>
                  <input type="text" value={roomFormData.equipment} onChange={(e) => setRoomFormData({ ...roomFormData, equipment: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Proyektor, Kompyuter, Doska" />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button onClick={handleSaveRoom} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Saqlash</button>
                <button onClick={() => setShowRoomModal(false)} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Bekor qilish</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && itemToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                  {deleteType === 'group' ? 'Guruhni' : 'Xonani'} o'chirish
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  <strong>{itemToDelete.name}</strong> {deleteType === 'group' ? 'guruhini' : 'xonasini'} o'chirilsinmi? Bu amal qaytarib bo'lmaydi.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteModal(false); setItemToDelete(null) }} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Bekor qilish</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">O'chirish</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Guruhlar va Xonalar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Guruhlar, dars jadvali va xonalarni boshqarish
          </p>
        </div>
        <button
          onClick={activeTab === 'groups' ? handleAddGroup : handleAddRoom}
          className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm ${
            activeTab === 'groups'
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {activeTab === 'groups' ? 'Qo\'shish' : 'Qo\'shish'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
        <button
          onClick={() => {
            setActiveTab('groups')
            setPage(1)
          }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
            activeTab === 'groups'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Guruhlar
        </button>
        <button
          onClick={() => {
            setActiveTab('rooms')
            setPage(1)
          }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
            activeTab === 'rooms'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Xonalar
        </button>
      </div>

      {/* ── Search ── */}
      <label className={`relative flex items-center gap-2 px-4 py-2.5 border rounded-lg w-full max-w-sm transition-all ${
        activeTab === 'groups'
          ? 'focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20'
          : 'focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
      } border-gray-200`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={activeTab === 'groups' ? 'Guruh nomi bo\'yicha qidirish…' : 'Xona nomi bo\'yicha qidirish…'}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </label>

      {/* ── Groups Tab ── */}
      {activeTab === 'groups' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Yuklanmoqda…</span>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Guruhlar yo'q</p>
                {search && <p className="text-xs">"{search}" bo'yicha natija yo'q</p>}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedGroups.map((group, idx) => {
                  const icon = getGroupIcon(group.name)
                  const course = courses.find(c => c.id === group.courseId)
                  const teacher = teachers.find(t => t.id === group.teacherId)
                  const room = rooms.find(r => r.id === group.roomId)

                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group cursor-pointer"
                      onClick={() => handleViewStudents(group)}
                    >
                      {/* Icon & Title */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${icon.bg}`}>
                          {icon.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{group.name}</h3>
                          <span className="text-xs text-gray-400 font-mono">
                            #{(page - 1) * itemsPerPage + idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                          <span className="text-gray-600 line-clamp-1">{course?.name || '—'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-600 line-clamp-1">{teacher?.name || '—'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-gray-600 line-clamp-1">{room?.name || '—'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                          </svg>
                          <span className="text-gray-600">
                            {group.currentStudents || group.students?.length || 0}/{group.maxStudents}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600 font-medium">
                            {Number(group.monthlyFeePerStudent).toLocaleString()} so'm
                          </span>
                        </div>

                        {group.schedule?.days?.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600 text-xs">
                              {group.schedule.days.slice(0, 3).join(', ')}{group.schedule.days.length > 3 ? '...' : ''} · {group.schedule.fromHour}-{group.schedule.toHour}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          O'quvchilarni ko'rish uchun karta ustiga bosing
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            O'chirish
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <span className="text-xs text-gray-500">
                    {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, groups.length)} / {groups.length} ta
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            page === pageNum
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-400">…</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            page === totalPages
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Rooms Tab ── */}
      {activeTab === 'rooms' && (
        <>
          {rooms.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Xonalar yo'q</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedRooms.map((room, idx) => {
                  const icon = getRoomIcon(room.name)
                  return (
                    <div
                      key={room.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group"
                    >
                      {/* Icon & Title */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${icon.bg}`}>
                          {icon.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{room.name}</h3>
                          <span className="text-xs text-gray-400 font-mono">
                            #{room.number}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                          </svg>
                          <span className="text-gray-600">
                            {room.capacity} kishi sig'imi
                          </span>
                        </div>

                        {room.equipment && room.equipment.length > 0 && (
                          <div className="flex items-start gap-2 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="flex flex-wrap gap-1">
                              {room.equipment.slice(0, 3).map((eq, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {eq}
                                </span>
                              ))}
                              {room.equipment.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  +{room.equipment.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          O'chirish
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <span className="text-xs text-gray-500">
                    {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, rooms.length)} / {rooms.length} ta
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            page === pageNum
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-400">…</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            page === totalPages
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Group Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingGroup ? 'Guruhni Tahrirlash' : 'Yangi Guruh'}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Guruh nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kurs <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  >
                    <option value="">Tanlang</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    O'qituvchi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  >
                    <option value="">Tanlang</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Xona <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  >
                    <option value="">Tanlang</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>{room.name} (#{room.number})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Boshlanish sanasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tugash sanasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Maksimal talabalar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Oylik to'lov (so'm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyFeePerStudent}
                    onChange={(e) => setFormData({ ...formData, monthlyFeePerStudent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dars kunlari</label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                        formData.schedule.days.includes(day)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Boshlanish vaqti</label>
                  <input
                    type="time"
                    value={formData.schedule.fromHour}
                    onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, fromHour: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tugash vaqti</label>
                  <input
                    type="time"
                    value={formData.schedule.toHour}
                    onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, toHour: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleSaveGroup}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Room Modal ── */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRoom ? 'Xonani Tahrirlash' : 'Yangi Xona'}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Xona nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Raqami <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomFormData.number}
                  onChange={(e) => setRoomFormData({ ...roomFormData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sig'imi <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jihozlar (vergul bilan)</label>
                <input
                  type="text"
                  value={roomFormData.equipment}
                  onChange={(e) => setRoomFormData({ ...roomFormData, equipment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Proyektor, Kompyuter, Doska"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleSaveRoom}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowRoomModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                {deleteType === 'group' ? 'Guruhni' : 'Xonani'} o'chirish
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                <strong>{itemToDelete.name}</strong> {deleteType === 'group' ? 'guruhini' : 'xonasini'} o'chirilsinmi? Bu amal qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setItemToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default GroupsPage
