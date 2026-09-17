import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Users, Search, Plus, Eye, Edit, Trash2, UserCheck, UserX, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  suspended: 'موقوف',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-600',
  inactive: 'bg-gray-100 text-gray-500',
  suspended: 'bg-red-50 text-red-500',
};

const StudentsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<any>({
    queryKey: ['adminStudents', search, status, page],
    queryFn: () => adminApi.getStudents({ search, status, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
  } as any);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateStudentStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminStudents'] }); toast.success('تم التحديث'); },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStudent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminStudents'] }); setDeleteConfirm(null); toast.success('تم الحذف'); },
    onError: () => toast.error('حدث خطأ'),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createStudent({ ...newStudent, role: 'student' } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminStudents'] });
      setShowCreate(false);
      setNewStudent({ name: '', email: '', password: '' });
      toast.success('تم إنشاء الطالب');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'حدث خطأ'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600" />
          إدارة الطلاب
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          طالب جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 shadow-sm"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-600 shadow-sm"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="suspended">موقوف</option>
        </select>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">إنشاء طالب جديد</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'الاسم', type: 'text', dir: 'rtl' },
                { key: 'email', label: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
                { key: 'password', label: 'كلمة المرور', type: 'password', dir: 'ltr' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm text-gray-500 font-semibold block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    dir={f.dir}
                    value={(newStudent as any)[f.key]}
                    onChange={e => setNewStudent(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              ))}
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
              >
                {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
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
            <p className="text-gray-500 text-sm mb-6">هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition-colors">إلغاء</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {['الطالب', 'البريد الإلكتروني', 'الحالة', 'تاريخ التسجيل', 'الإجراءات'].map(h => (
                  <th key={h} className="text-right text-xs text-gray-500 font-semibold px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    {[1,2,3,4,5].map(j => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.students?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                data?.students?.map((student: any) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                          {student.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm" dir="ltr">{student.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLORS[student.status] || STATUS_COLORS.inactive}`}>
                        {STATUS_LABELS[student.status] || student.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm">
                      {new Date(student.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/students/${student.id}`)} title="عرض الملف" className="text-blue-600 hover:text-blue-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {student.status === 'active' ? (
                          <button onClick={() => statusMutation.mutate({ id: student.id, status: 'suspended' })} title="تعليق" className="text-amber-500 hover:text-amber-600 transition-colors">
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => statusMutation.mutate({ id: student.id, status: 'active' })} title="تفعيل" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteConfirm(student.id)} title="حذف" className="text-red-500 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg font-bold transition-colors text-sm ${p === page ? 'bg-indigo-600 text-white shadow-sm' : 'bg-[#f4f7fe] border border-gray-200 text-gray-600 hover:border-indigo-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
