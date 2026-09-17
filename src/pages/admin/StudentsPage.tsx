import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Users, Search, Plus, Eye, Edit, Trash2, UserCheck, UserX, X, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  suspended: 'موقوف',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-background text-muted',
  suspended: 'bg-red-500/20 text-red-400',
};

const StudentsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [grade, setGrade] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', grade: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<any>({
    queryKey: ['adminStudents', search, status, grade, page],
    queryFn: () => adminApi.getStudents({ search, status, grade, page, limit: 20 }).then(r => r.data),
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
      setNewStudent({ name: '', email: '', password: '', grade: '' });
      toast.success('تم إنشاء الطالب');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'حدث خطأ'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          سجل الطلاب المتقدم
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary hover:brightness-110 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          طالب جديد
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-muted mr-2">
          <Filter className="w-5 h-5" />
          <span className="font-bold text-sm">تصفية:</span>
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="بحث بالاسم أو البريد أو ID..."
            className="w-full bg-background border border-border rounded-xl px-4 py-2 pr-10 text-white placeholder-muted focus:outline-none focus:border-primary shadow-sm"
          />
        </div>
        <select
          value={grade}
          onChange={e => { setGrade(e.target.value); setPage(1); }}
          className="bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary shadow-sm min-w-32"
        >
          <option value="">كل الصفوف</option>
          <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
          <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
          <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
          <option value="إعدادي">إعدادي</option>
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary shadow-sm min-w-32"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="suspended">موقوف</option>
        </select>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">إنشاء طالب جديد</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted hover:text-white" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'الاسم', type: 'text', dir: 'rtl' },
                { key: 'email', label: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
                { key: 'password', label: 'كلمة المرور', type: 'password', dir: 'ltr' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm text-muted font-semibold block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    dir={f.dir}
                    value={(newStudent as any)[f.key]}
                    onChange={e => setNewStudent(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-muted font-semibold block mb-1">الصف الدراسي</label>
                <select
                  value={newStudent.grade}
                  onChange={e => setNewStudent(p => ({ ...p, grade: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">اختر الصف...</option>
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                </select>
              </div>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="w-full bg-primary hover:brightness-110 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 shadow-lg mt-2"
              >
                {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">تأكيد الحذف</h2>
            <p className="text-muted text-sm mb-6">هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع وسيتم مسح كافة السجلات التابعة له.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-border text-muted py-2 rounded-xl hover:bg-background transition-colors">إلغاء</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                {['ID', 'الطالب', 'البريد الإلكتروني', 'الصف', 'آخر ظهور', 'الحالة', 'الإجراءات'].map(h => (
                  <th key={h} className="text-right text-xs text-muted font-bold px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-border animate-pulse">
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-background rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.students?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              ) : (
                data?.students?.map((student: any) => (
                  <tr key={student.id} className="border-b border-border hover:bg-background/60 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-muted">#{student.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                          {student.profile_image ? (
                            <img src={student.profile_image} className="w-full h-full rounded-full object-cover" />
                          ) : student.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-white text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted text-sm" dir="ltr">{student.email}</td>
                    <td className="px-5 py-4 text-muted text-sm">{student.grade || '-'}</td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {student.last_login ? new Date(student.last_login).toLocaleDateString('ar-EG') : 'لم يدخل بعد'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_COLORS[student.status] || STATUS_COLORS.inactive}`}>
                        {STATUS_LABELS[student.status] || student.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/admin/students/${student.id}`)} title="عرض التقرير المفصل" className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 p-2 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        {student.status === 'active' ? (
                          <button onClick={() => statusMutation.mutate({ id: student.id, status: 'suspended' })} title="تعليق" className="text-amber-500 hover:text-amber-600 transition-colors p-2 rounded-lg hover:bg-amber-500/10">
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => statusMutation.mutate({ id: student.id, status: 'active' })} title="تفعيل" className="text-green-400 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-green-500/10">
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteConfirm(student.id)} title="حذف" className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10">
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
          <div className="flex justify-center gap-2 p-4 border-t border-border bg-background/20">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg font-bold transition-colors text-sm ${p === page ? 'bg-primary text-white shadow-lg' : 'bg-card border border-border text-muted hover:border-primary'}`}
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
