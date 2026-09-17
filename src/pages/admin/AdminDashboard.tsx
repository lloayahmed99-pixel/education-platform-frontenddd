import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users, BookOpen, Video, Award, TrendingUp, Clock, CheckCircle,
  Activity, GraduationCap, Shield, UserPlus, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => api.get('/admin/dashboard/stats').then(r => r.data),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 bg-card rounded-2xl border border-border" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'إجمالي الطلاب', value: data?.totalStudents ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'الطلاب النشطون (هذا الشهر)', value: data?.activeStudents ?? 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
    { label: 'تسجيلات جديدة (آخر 7 أيام)', value: data?.newRegistrations ?? 0, icon: UserPlus, color: 'text-primary', bg: 'bg-primary/20' },
    { label: 'يتعلمون الآن (اليوم)', value: data?.learningNow ?? 0, icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { label: 'إجمالي الكورسات', value: data?.totalCourses ?? 0, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'إجمالي الاختبارات المحلولة', value: data?.totalExamsTaken ?? 0, icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { label: 'متوسط درجات الامتحانات', value: `${Math.round(data?.averageScore ?? 0)}%`, icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { label: 'إجمالي المشاهدات', value: data?.totalVideoViews ?? 0, icon: Video, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Shield className="w-7 h-7 text-primary" />
        لوحة تحكم الإدارة الشاملة
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-all shadow-md">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-muted text-xs font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        {data?.recentActivity && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                أحدث نشاطات الطلاب
              </h2>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {data.recentActivity.length > 0 ? data.recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      <Link to={`/admin/students/${log.user_id}`} className="font-bold hover:text-primary transition-colors">
                        {log.user_name || 'طالب غير معروف'}
                      </Link>
                      {' '}
                      <span className="text-muted text-xs">{
                        log.action === 'login' ? 'قام بتسجيل الدخول' :
                        log.action === 'started_video' ? 'بدأ مشاهدة فيديو' :
                        log.action === 'completed_video' ? 'أنهى مشاهدة فيديو' :
                        log.action === 'started_quiz' ? 'بدأ امتحان' :
                        log.action === 'submitted_quiz' ? 'سلم امتحان' :
                        log.action === 'downloaded_file' ? 'قام بتحميل ملف' :
                        log.action
                      }</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0" dir="ltr">
                    {new Date(log.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )) : (
                <p className="text-muted text-sm text-center py-10">لا يوجد نشاطات حديثة</p>
              )}
            </div>
          </div>
        )}

        {/* Activity Chart */}
        {data?.activityChart && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4">معدل النشاط (آخر 7 أيام)</h2>
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.activityChart} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3a5c" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2342', borderColor: '#2d3a5c', color: '#f8fafc', borderRadius: '8px' }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#colorActivity)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
