import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard';
import { Users, BookOpen, Flag, MessageSquare, ShieldCheck } from 'lucide-react';

const ModeratorDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['moderatorDashboard'],
    queryFn: () => dashboardApi.getModeratorDashboard().then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <ShieldCheck className="w-7 h-7 text-primary" />
        لوحة تحكم المشرف
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'الطلاب', value: data?.totalStudents ?? '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'الكورسات', value: data?.totalCourses ?? '—', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'مقالات المنتدى', value: data?.totalPosts ?? '—', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'البلاغات المعلقة', value: data?.pendingReports ?? '—', icon: Flag, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-muted text-xs">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{isLoading ? '...' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-muted text-center py-8">استخدم القائمة الجانبية للتنقل بين صفحات الإشراف</p>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
