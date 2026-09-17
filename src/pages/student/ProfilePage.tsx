import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { authApi } from '../../api/auth';
import { User, Camera, Mail, Lock, Save, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [saving, setSaving] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => api.get('/dashboard/student').then(r => r.data),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', { name, profile_image: profileImage });
      updateUser({ name, profile_image: profileImage });
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
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <User className="w-7 h-7 text-indigo-600" />
        حسابي
      </h1>

      {/* Avatar Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-indigo-100 border-2 border-indigo-400 flex items-center justify-center text-indigo-600 text-2xl font-bold flex-shrink-0 overflow-hidden">
          {profileImage || user?.profile_image ? (
            <img src={profileImage || user?.profile_image} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.name || 'U')
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-2 bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full font-semibold">
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
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-indigo-600">{s.value}</h3>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg">تعديل المعلومات</h3>
        
        <ImageUpload 
          label="الصورة الشخصية"
          value={profileImage}
          onChange={(url) => setProfileImage(url)}
        />
        
        <div>
          <label className="text-sm text-gray-600 font-semibold block mb-2">الاسم</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 font-semibold block mb-2">البريد الإلكتروني</label>
          <input
            value={user?.email || ''}
            disabled
            dir="ltr"
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed text-left"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-colors"
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
