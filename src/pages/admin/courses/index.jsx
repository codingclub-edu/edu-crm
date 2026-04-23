import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit3, Trash2, BookOpen, 
  Clock, DollarSign, X, AlertCircle, MoreVertical, LayoutGrid
} from 'lucide-react';
import {
  getAllCourses, createCourse, updateCourse, deleteCourse
} from '../../../api/courses';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [search, setSearch] = useState('');

  // Server talab qilgan maydonlar
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    syllabus: ''
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses({ search });
      setCourses(res.data.data || res.data || []);
    } catch (err) {
      console.error('Yuklashda xato:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, [search]);

  const handleSaveCourse = async () => {
    if (!formData.title || !formData.price || !formData.duration) {
      return alert("Sarlavha, Narx va Davomiylik kiritilishi shart!");
    }

    try {
      const dataToSend = {
        title: formData.title.trim(),
        description: formData.description.trim() || "Tavsif yo'q",
        price: Number(formData.price),
        duration: formData.duration.trim(),
        syllabus: formData.syllabus.trim() || ""
      };

      if (editingCourse) {
        const id = editingCourse._id || editingCourse.id;
        await updateCourse(id, dataToSend);
      } else {
        await createCourse(dataToSend);
      }
      setShowModal(false);
      loadCourses();
      setFormData({ title: '', description: '', price: '', duration: '', syllabus: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Server xatosi (400)");
    }
  };

  const confirmDelete = async () => {
    try {
      const id = courseToDelete._id || courseToDelete.id;
      await deleteCourse(id);
      setShowDeleteModal(false);
      loadCourses();
    } catch (err) {
      alert("O'chirishda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      
      {/* ── HEADER ── */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-indigo-600" />
            Kurslar Boshqaruvi
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Coding Club IT markazi o'quv dasturlari</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Kurslarni qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setEditingCourse(null); setFormData({ title:'', description:'', price:'', duration:'', syllabus:'' }); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-sm font-bold active:scale-95"
          >
            <Plus className="w-4 h-4" /> Yangi Kurs
          </button>
        </div>
      </div>

      {/* ── COURSE GRID ── */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {courses.map((course) => (
                <motion.div
                  key={course._id || course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                        <BookOpen className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCourse(course); setFormData({ ...course, price: course.price?.toString() }); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Edit3 className="w-4 h-4"/></button>
                        <button onClick={() => { setCourseToDelete(course); setShowDeleteModal(true); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tight">
                      {course.title}
                    </h3>
                    
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-6 h-8">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between py-3 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-semibold">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[13px] font-bold text-slate-900">
                          {Number(course.price).toLocaleString()} <small className="text-[10px] text-slate-400">UZS</small>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── MODERN MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-slate-800 text-lg">{editingCourse ? 'Kursni Tahrirlash' : 'Yangi Kurs Qo\'shish'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Kurs Sarlavhasi (Title)</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    placeholder="Masalan: Full-Stack Web Development"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Narxi (UZS)</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                      placeholder="800000"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Davomiyligi</label>
                    <input 
                      className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                      placeholder="6 oy"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tavsif (Description)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none h-24"
                    placeholder="Kurs haqida qisqacha..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors">Bekor qilish</button>
                <button onClick={handleSaveCourse} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                  {editingCourse ? 'O\'zgarishlarni Saqlash' : 'Kursni Yaratish'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3"><AlertCircle className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Kursni o'chirish?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Ushbu kursni butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Yo'q, qolsin</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all">Ha, o'chirilsin</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesPage;