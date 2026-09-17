import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Shield, Plus, Trash2, CheckSquare, Square, X, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_PERMISSIONS = [
  { name: 'view_students', label: 'عرض الطلاب' },
  { name: 'manage_students', label: 'إدارة الطلاب' },
  { name: 'view_courses', label: 'عرض الكورسات' },
  { name: 'manage_courses', label: 'إدارة الكورسات' },
  { name: 'manage_videos', label: 'إدارة الفيديوهات' },
  { name: 'manage_quizzes', label: 'إدارة الاختبارات' },
  { name: 'moderate_forum', label: 'إدارة المنتدى' },
  { name: 'manage_reports', label: 'إدارة البلاغات' },
  { name: 'send_notifications', label: 'إرسال الإشعارات' },
];

const ModeratorsPage = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newMod, setNewMod] = useState({ name: '', email: '', password: '' });
  const [editPerms, setEditPerms] = useState<{ id: number; perms: string[] } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: moderators, isLoading } = useQuery({
    queryKey: ['adminModerators'],
    queryFn: () => adminApi.getModerators().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createModerator(newMod),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminModerators'] });
      setShowCreate(false);
      setNewMod({ name: '', email: '', password: '' });
      toast.success('تم إنشاء المشرف');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteModerator(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminModerators'] }); setDeleteConfirm(null); toast.success('تم الحذف'); },
  });

  const permsMutation = useMutation({
    mutationFn: ({ id, perms }: { id: number; perms: string[] }) =>
      adminApi.updateModeratorPermissions(id, perms),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminModerators'] }); setEditPerms(null); toast.success('تم تحديث الأذونات'); },
    onError: () => toast.error('حدث خطأ'),
  });

  const togglePerm = (perm: string) => {
    if (!editPerms) return;
    setEditPerms(prev => prev ? {
      ...prev,
      perms: prev.perms.includes(perm) ? prev.perms.filter(p => p !== perm) : [...prev.perms, perm]
    } : null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-indigo-600" />
          إدارة المشرفين
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          مشرف جديد
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">إنشاء مشرف جديد</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'الاسم', type: 'text' },
                { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
                { key: 'password', label: 'كلمة المرور', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm text-gray-500 font-semibold block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(newMod as any)[f.key]}
                    onChange={e => setNewMod(p => ({ ...p, [f.key]: e.target.value }))}
                    dir={f.type === 'email' || f.type === 'password' ? 'ltr' : 'rtl'}
                    className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              ))}
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-60 shadow-sm transition-colors"
              >
                {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {editPerms && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">تعديل الأذونات</h2>
              <button onClick={() => setEditPerms(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-2 mb-6">
              {ALL_PERMISSIONS.map(p => (
                <button
                  key={p.name}
                  onClick={() => togglePerm(p.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    editPerms.perms.includes(p.name)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  {editPerms.perms.includes(p.name)
                    ? <CheckSquare className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    : <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => permsMutation.mutate({ id: editPerms.id, perms: editPerms.perms })}
              disabled={permsMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-60 shadow-sm transition-colors"
            >
              حفظ الأذونات
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">تأكيد الحذف</h2>
            <p className="text-gray-500 text-sm mb-6">هل أنت متأكد من حذف هذا المشرف؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition-colors">إلغاء</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold transition-colors">حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Moderators Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-200 shadow-sm" />)}
        </div>
      ) : (moderators as any[])?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>لا يوجد مشرفون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(moderators as any[])?.map((mod: any) => (
            <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {mod.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{mod.user?.name}</h3>
                  <p className="text-xs text-gray-500 truncate" dir="ltr">{mod.user?.email}</p>
                </div>
              </div>
              {/* Permissions */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(mod.permissions || []).map((p: any) => (
                  <span key={p.id || p.name} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                    {ALL_PERMISSIONS.find(ap => ap.name === (p.name || p))?.label || p.name || p}
                  </span>
                ))}
                {(!mod.permissions || mod.permissions.length === 0) && (
                  <span className="text-xs text-gray-400">لا توجد أذونات</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditPerms({
                    id: mod.id,
                    perms: (mod.permissions || []).map((p: any) => p.name || p)
                  })}
                  className="flex-1 text-xs border border-indigo-200 text-indigo-600 py-2 rounded-xl hover:bg-indigo-50 transition-colors font-semibold"
                >
                  تعديل الأذونات
                </button>
                <button
                  onClick={() => setDeleteConfirm(mod.id)}
                  className="text-red-500 hover:text-red-600 p-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeratorsPage;
