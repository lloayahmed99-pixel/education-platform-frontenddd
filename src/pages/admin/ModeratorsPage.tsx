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
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          إدارة المشرفين
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          مشرف جديد
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">إنشاء مشرف جديد</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted hover:text-white" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'الاسم', type: 'text' },
                { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
                { key: 'password', label: 'كلمة المرور', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm text-muted font-semibold block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(newMod as any)[f.key]}
                    onChange={e => setNewMod(p => ({ ...p, [f.key]: e.target.value }))}
                    dir={f.type === 'email' || f.type === 'password' ? 'ltr' : 'rtl'}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="w-full bg-primary hover:bg-amber-500 text-white font-bold py-3 rounded-xl disabled:opacity-60"
              >
                {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {editPerms && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">تعديل الأذونات</h2>
              <button onClick={() => setEditPerms(null)}><X className="w-5 h-5 text-muted hover:text-white" /></button>
            </div>
            <div className="space-y-2 mb-6">
              {ALL_PERMISSIONS.map(p => (
                <button
                  key={p.name}
                  onClick={() => togglePerm(p.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    editPerms.perms.includes(p.name)
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-border text-muted hover:border-primary/50'
                  }`}
                >
                  {editPerms.perms.includes(p.name)
                    ? <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                    : <Square className="w-5 h-5 flex-shrink-0" />
                  }
                  <span className="text-sm">{p.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => permsMutation.mutate({ id: editPerms.id, perms: editPerms.perms })}
              disabled={permsMutation.isPending}
              className="w-full bg-primary hover:bg-amber-500 text-white font-bold py-3 rounded-xl disabled:opacity-60"
            >
              حفظ الأذونات
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">تأكيد الحذف</h2>
            <p className="text-muted text-sm mb-6">هل أنت متأكد من حذف هذا المشرف؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-border text-muted py-2 rounded-xl hover:text-white">إلغاء</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm)} className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold">حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Moderators Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-48 bg-card rounded-2xl border border-border" />)}
        </div>
      ) : (moderators as any[])?.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>لا يوجد مشرفون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(moderators as any[])?.map((mod: any) => (
            <div key={mod.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                  {mod.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{mod.user?.name}</h3>
                  <p className="text-xs text-muted truncate" dir="ltr">{mod.user?.email}</p>
                </div>
              </div>
              {/* Permissions */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(mod.permissions || []).map((p: any) => (
                  <span key={p.id || p.name} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {ALL_PERMISSIONS.find(ap => ap.name === (p.name || p))?.label || p.name || p}
                  </span>
                ))}
                {(!mod.permissions || mod.permissions.length === 0) && (
                  <span className="text-xs text-muted">لا توجد أذونات</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditPerms({
                    id: mod.id,
                    perms: (mod.permissions || []).map((p: any) => p.name || p)
                  })}
                  className="flex-1 text-xs border border-primary/50 text-primary py-2 rounded-xl hover:bg-primary/10 transition-colors font-semibold"
                >
                  تعديل الأذونات
                </button>
                <button
                  onClick={() => setDeleteConfirm(mod.id)}
                  className="text-red-400 hover:text-red-300 p-2 transition-colors"
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
