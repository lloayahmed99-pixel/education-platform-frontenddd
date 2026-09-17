import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import coursesApi from '../../api/courses';
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, X, Search, List } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';

const AdminCoursesPage = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', description: '', price: 0, thumbnail: '', duration_hours: 0 });

  const { data, isLoading } = useQuery<any>({
    queryKey: ['adminCourses', search, page],
    queryFn: () => coursesApi.getAllAdmin({ search, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
  } as any);

  const createMutation = useMutation({
    mutationFn: () => editCourse
      ? coursesApi.update(editCourse.id, form)
      : coursesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCourses'] });
      setShowForm(false);
      setEditCourse(null);
      setForm({ title: '', description: '', price: 0, thumbnail: '', duration_hours: 0 });
      toast.success(editCourse ? 'تم التحديث' : 'تم إنشاء الكورس');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminCourses'] }); setDeleteConfirm(null); toast.success('تم الحذف'); },
    onError: () => toast.error('حدث خطأ'),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      coursesApi.update(id, { published: !published }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminCourses'] }); toast.success('تم التحديث'); },
  });

  const openEdit = (course: any) => {
    setEditCourse(course);
    setForm({ title: course.title, description: course.description || '', price: course.price, thumbnail: course.thumbnail || '', duration_hours: course.duration_hours || 0 });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600" />
          إدارة الكورسات
        </h1>
        <button onClick={() => { setEditCourse(null); setForm({ title: '', description: '', price: 0, thumbnail: '', duration_hours: 0 }); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> كورس جديد
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 shadow-sm" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editCourse ? 'تعديل الكورس' : 'كورس جديد'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'title', label: 'العنوان', type: 'text' },
                { key: 'description', label: 'الوصف', type: 'textarea' },
                { key: 'price', label: 'السعر (جنيه)', type: 'number' },
                { key: 'duration_hours', label: 'المدة (ساعات)', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm text-gray-500 font-semibold block mb-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      rows={3} className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600 resize-none" />
                  ) : (
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      dir={f.type === 'url' ? 'ltr' : 'rtl'}
                      className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600" />
                  )}
                </div>
              ))}
              
              <ImageUpload
                label="صورة الكورس"
                value={form.thumbnail}
                onChange={(url) => setForm(p => ({ ...p, thumbnail: url }))}
              />
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-60 shadow-sm transition-colors">
                {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">تأكيد الحذف</h2>
            <p className="text-gray-500 text-sm mb-6">سيتم حذف الكورس وجميع محتوياته.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition-colors">إلغاء</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold transition-colors">حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {['الكورس', 'السعر', 'المدة', 'الحالة', 'الإجراءات'].map(h => (
                  <th key={h} className="text-right text-xs text-gray-500 font-semibold px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    {[1,2,3,4,5].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded" /></td>)}
                  </tr>
                ))
              ) : data?.courses?.map((course: any) => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <span className="font-semibold text-gray-900 text-sm">{course.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-indigo-600 font-bold text-sm">{course.price} ج.م</td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{course.duration_hours} ساعة</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${course.published ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {course.published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => publishMutation.mutate({ id: course.id, published: !!course.published })} title={course.published ? 'إخفاء' : 'نشر'} className={course.published ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-600 hover:text-emerald-700'}>
                        {course.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => navigate(`/admin/courses/${course.id}/content`)} title="إدارة المحتوى" className="text-purple-600 hover:text-purple-700">
                        <List className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(course)} title="تعديل الكورس" className="text-blue-600 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(course.id)} title="حذف" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesPage;
