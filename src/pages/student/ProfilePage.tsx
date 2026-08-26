import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { authApi } from '../../api/auth';
import { User, Camera, Mail, Lock, Save, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => api.get('/dashboard/student').then(r => r.data),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', { name });
      updateUser({ name });
      toast.success('تم حفظ التغييرات');
    } catch {
      toast.error('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <User className="w-7 h-7 text-primary" />
        حسابي
      </h1>

      {/* Avatar Section */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0">
          {user?.profile_image ? (
            <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user?.name || 'U')
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-muted text-sm">{user?.email}</p>
          <span className="inline-block mt-2 bg-primary/20 text-primary text-xs px-3 py-1 rounded-full font-semibold">
            طالب
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'كورسات مكتملة', value: stats?.completedCourses ?? 0 },
          { label: 'كورسات حالية', value: stats?.currentCourses ?? 0 },
          { label: 'فيديوهات محفوظة', value: stats?.savedVideos ?? 0 },
          { label: 'اختبارات مكتملة', value: stats?.quizzesCompleted ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <h3 className="text-2xl font-bold text-primary">{s.value}</h3>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Info */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-lg">تعديل المعلومات</h3>
        <div>
          <label className="text-sm text-muted font-semibold block mb-2">الاسم</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-sm text-muted font-semibold block mb-2">البريد الإلكتروني</label>
          <input
            value={user?.email || ''}
            disabled
            dir="ltr"
            className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-muted cursor-not-allowed text-left"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="flex items-center gap-2 border border-red-500/50 text-red-400 hover:bg-red-400/10 px-4 py-3 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
