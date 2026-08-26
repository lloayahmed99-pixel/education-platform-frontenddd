import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PlayCircle, CheckCircle, BookOpen, Bookmark, Clock, Video, Award, BarChart2 } from 'lucide-react';
import CourseCard from '../../components/student/CourseCard';
import coursesApi from '../../api/courses';

const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => api.get('/dashboard/student').then(r => r.data),
    refetchInterval: 60000,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['recommendedCourses'],
    queryFn: () => coursesApi.getAll({ published: true, limit: 6 }).then(r => r.data),
  });

  const formatSeconds = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} دقيقة`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} ساعة ${m} دقيقة` : `${h} ساعة`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-card rounded-xl border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-card rounded-xl border border-border" />
          <div className="h-64 bg-card rounded-xl border border-border" />
        </div>
      </div>
    );
  }

  const latest = dashboardData?.latestProgress;
  const weeklyData = dashboardData?.weeklyActivity || [
    { day: 'السبت', minutes: 0, prevMinutes: 0 },
    { day: 'الأحد', minutes: 0, prevMinutes: 0 },
    { day: 'الاثنين', minutes: 0, prevMinutes: 0 },
    { day: 'الثلاثاء', minutes: 0, prevMinutes: 0 },
    { day: 'الأربعاء', minutes: 0, prevMinutes: 0 },
    { day: 'الخميس', minutes: 0, prevMinutes: 0 },
    { day: 'الجمعة', minutes: 0, prevMinutes: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Top 3 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'كورسات مكملة',
            value: dashboardData?.completedCourses ?? 0,
            icon: CheckCircle,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
          },
          {
            label: 'كورساتك الحالية',
            value: dashboardData?.currentCourses ?? 0,
            icon: BookOpen,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            label: 'الفيديوهات المحفوظة',
            value: dashboardData?.savedVideos ?? 0,
            icon: Bookmark,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4 hover:border-primary/50 transition-colors shadow-lg"
          >
            <div className={`${card.bg} p-4 rounded-2xl`}>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
            <div>
              <p className="text-muted text-sm font-medium mb-1">{card.label}</p>
              <h3 className="text-4xl font-bold text-white">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row: Continue Learning + Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* استكمال التعلم */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-primary" />
            استكمال التعلم
          </h2>
          {latest ? (
            <div className="bg-background rounded-xl p-5 space-y-4">
              {latest.video?.thumbnail && (
                <img
                  src={latest.video.thumbnail}
                  alt={latest.video?.title}
                  className="w-full h-36 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
                  {latest.course?.title}
                </p>
                <h3 className="text-white text-lg font-bold mb-3">{latest.video?.title}</h3>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>
                    {formatSeconds(latest.current_position)} / {formatSeconds(latest.duration)}
                  </span>
                  <span>{Math.round(latest.completion_percentage)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${latest.completion_percentage}%` }}
                  />
                </div>
                {latest.last_watched_at && (
                  <p className="text-xs text-muted">
                    آخر مشاهدة:{' '}
                    {new Date(latest.last_watched_at).toLocaleDateString('ar-EG', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  navigate(`/student/video/${latest.video_id}?pos=${Math.floor(latest.current_position)}`)
                }
                className="w-full bg-primary hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                استكمال المشاهدة
              </button>
            </div>
          ) : (
            <div className="bg-background rounded-xl p-8 text-center">
              <Video className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted text-sm">لم تشاهد أي فيديو بعد</p>
              <p className="text-xs text-muted/70 mt-1">ابدأ التعلم من الكورسات أدناه</p>
            </div>
          )}
        </div>

        {/* نشاطك التعليمي */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-bold text-white mb-4">نشاطك التعليمي (دقائق)</h2>
          <div className="h-56 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#334155" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#334155" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  labelStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                />
                <Legend
                  formatter={(value) => (value === 'minutes' ? 'هذا الأسبوع' : 'الأسبوع الماضي')}
                  wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#f59e0b" fill="url(#colorCurrent)" name="minutes" strokeWidth={2} />
                <Area type="monotone" dataKey="prevMinutes" stroke="#64748b" fill="url(#colorPrev)" name="prevMinutes" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted mt-3 text-center">
            أكمل كورساتك يومياً لترى نشاطاً أكبر في الرسم البياني
          </p>
        </div>
      </div>

      {/* Learning Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" />
          إحصائيات التعلم
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            {
              label: 'إجمالي وقت التعلم',
              value: formatMinutes(Math.round((dashboardData?.totalLearningMinutes ?? 0))),
              icon: Clock,
            },
            { label: 'الفيديوهات المشاهدة', value: dashboardData?.videosWatched ?? 0, icon: Video },
            { label: 'الفيديوهات المكتملة', value: dashboardData?.videosCompleted ?? 0, icon: CheckCircle },
            { label: 'الاختبارات المكتملة', value: dashboardData?.quizzesCompleted ?? 0, icon: Award },
            {
              label: 'متوسط النتائج',
              value: dashboardData?.averageQuizScore != null
                ? `${Math.round(dashboardData.averageQuizScore)}%`
                : 'لا يوجد',
              icon: BarChart2,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-4 rounded-2xl text-center hover:border-primary/50 transition-colors">
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <h4 className="text-xl font-bold text-white mb-1">{stat.value}</h4>
              <p className="text-xs text-muted leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          الكورسات المقترحة
        </h2>
        {coursesData?.courses && coursesData.courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>لا توجد كورسات متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
