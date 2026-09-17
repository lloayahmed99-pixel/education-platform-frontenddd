import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users, BookOpen, Video, Award, TrendingUp, Clock, CheckCircle,
  Activity, GraduationCap, Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => dashboardApi.getAdminDashboard().then(r => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-200 shadow-sm" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'إجمالي الطلاب', value: data?.totalStudents ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'الطلاب النشطون', value: data?.activeStudents ?? 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'إجمالي الكورسات', value: data?.totalCourses ?? 0, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'الكورسات المنشورة', value: data?.publishedCourses ?? 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'إجمالي الفيديوهات', value: data?.totalVideos ?? 0, icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'إجمالي الاختبارات', value: data?.totalQuizzes ?? 0, icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'إجمالي التسجيلات', value: data?.totalEnrollments ?? 0, icon: GraduationCap, color: 'text-pink-600', bg: 'bg-pink-50' },
    {
      label: 'إجمالي وقت التعلم',
      value: `${Math.round(data?.totalLearningHours ?? 0)} ساعة`,
      icon: Clock,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-7 h-7 text-indigo-600" />
        لوحة تحكم الإدارة
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all shadow-sm">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            النشاط الأخير
          </h2>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.user?.name || 'مستخدم'}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(log.created_at).toLocaleDateString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
