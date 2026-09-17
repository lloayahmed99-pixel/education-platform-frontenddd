import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import api from '../../api/axios';
import { ArrowRight, User, BookOpen, Video, Award, Clock, UserCheck, UserX, Activity, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const ExamDetailsModal = ({ attempt, onClose }: { attempt: any, onClose: () => void }) => {
  let answers = [];
  try {
    if (typeof attempt.answers_json === 'string') {
      answers = JSON.parse(attempt.answers_json);
    } else if (attempt.answers_json) {
      answers = attempt.answers_json;
    }
  } catch(e) {}

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-xl">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">تفاصيل امتحان: {attempt.quiz_title || `امتحان #${attempt.quiz_id}`}</h2>
            <p className="text-muted text-sm mt-1">النتيجة: <span className={attempt.passed ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{Math.round(attempt.score)}%</span></p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors bg-background p-2 rounded-lg">إغلاق</button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {answers.length > 0 ? (
            answers.map((ans: any, idx: number) => (
              <div key={idx} className="bg-background border border-border rounded-xl p-5">
                <p className="font-bold text-white mb-4"><span className="text-primary ml-1">{idx + 1}.</span> {ans.question_text || `سؤال ${ans.question_id}`}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-border flex-shrink-0" />
                    <span className="text-sm text-white">إجابة الطالب: {ans.selected_answer_text || 'غير متوفر'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${ans.is_correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {ans.is_correct ? 'صحيحة' : 'خاطئة'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted text-center py-10">لا توجد تفاصيل للإجابات محفوظة في هذا الامتحان</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const { data: student, isLoading } = useQuery({
    queryKey: ['adminStudent', id],
    queryFn: () => adminApi.getStudentById(id!).then(r => r.data),
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['adminStudentActivity', id],
    queryFn: () => api.get(`/admin/students/${id}/activity`).then(r => r.data),
    enabled: activeTab === 'activity',
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateStudentStatus(id!, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminStudent', id] }); toast.success('تم التحديث'); },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-card border border-border rounded-xl w-32 shadow-lg" />
        <div className="h-48 bg-card border border-border rounded-2xl shadow-lg" />
      </div>
    );
  }

  if (!student) return <div className="text-center py-20 text-muted">الطالب غير موجود</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-muted hover:text-white transition-colors bg-card px-4 py-2 rounded-xl border border-border shadow-md w-max">
        <ArrowRight className="w-5 h-5" />
        رجوع للطلاب
      </button>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-wrap items-start gap-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10" />
        <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-3xl font-bold flex-shrink-0 overflow-hidden">
          {student.profile_image ? (
            <img src={student.profile_image} className="w-full h-full object-cover" />
          ) : student.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">{student.name}</h1>
          <p className="text-muted text-sm font-mono" dir="ltr">{student.email}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted">رقم ID</p>
              <p className="font-bold text-white font-mono">#{student.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted">الصف الدراسي</p>
              <p className="font-bold text-primary">{(student as any).grade || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-xs text-muted">هاتف الطالب</p>
              <p className="font-bold text-white font-mono" dir="ltr">{(student as any).phone || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted">آخر ظهور</p>
              <p className="font-bold text-white">{(student as any).last_login ? new Date((student as any).last_login).toLocaleDateString('ar-EG') : '-'}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4 flex-wrap items-center">
            <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${
              student.status === 'active' ? 'bg-green-500/20 text-green-400' :
              student.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
              'bg-background text-muted'
            }`}>
              {student.status === 'active' ? 'نشط' : student.status === 'suspended' ? 'موقوف' : 'غير نشط'}
            </span>
            <span className="text-xs text-muted">
              عضو منذ {new Date(student.created_at!).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {student.status === 'active' ? (
            <button
              onClick={() => statusMutation.mutate('suspended')}
              className="flex items-center gap-2 border border-amber-500/50 text-amber-500 px-4 py-2 rounded-xl hover:bg-amber-500/10 transition-colors text-sm font-bold shadow-sm"
            >
              <UserX className="w-4 h-4" />
              تعليق الحساب
            </button>
          ) : (
            <button
              onClick={() => statusMutation.mutate('active')}
              className="flex items-center gap-2 border border-green-500/50 text-green-400 px-4 py-2 rounded-xl hover:bg-green-500/10 transition-colors text-sm font-bold shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              تفعيل الحساب
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-card border border-border p-2 rounded-2xl shadow-sm">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: User },
          { id: 'courses', label: 'الكورسات', icon: BookOpen },
          { id: 'exams', label: 'الامتحانات', icon: Award },
          { id: 'activity', label: 'النشاط (Timeline)', icon: Activity },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${
              activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-muted hover:bg-background hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                ملخص الكورسات
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-background p-4 rounded-xl">
                  <span className="text-muted">مسجل في</span>
                  <span className="text-xl font-bold text-white">{student.enrollments?.length || 0} كورسات</span>
                </div>
                <div className="flex justify-between items-center bg-background p-4 rounded-xl">
                  <span className="text-muted">فيديوهات شاهدها</span>
                  <span className="text-xl font-bold text-white">{student.videoProgress?.length || 0} فيديوهات</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                ملخص الامتحانات
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-background p-4 rounded-xl">
                  <span className="text-muted">امتحانات تم حلها</span>
                  <span className="text-xl font-bold text-white">{student.quizAttempts?.length || 0} امتحان</span>
                </div>
                <div className="flex justify-between items-center bg-background p-4 rounded-xl">
                  <span className="text-muted">امتحانات اجتازها</span>
                  <span className="text-xl font-bold text-green-400">
                    {student.quizAttempts?.filter((a: any) => a.passed).length || 0} نجاح
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4">الكورسات المشترك بها</h2>
            <div className="space-y-3">
              {student.enrollments && student.enrollments.length > 0 ? student.enrollments.map((enr: any) => (
                <div key={enr.id} className="flex items-center justify-between bg-background border border-border rounded-xl p-4 hover:border-primary transition-colors">
                  <div>
                    <span className="text-white font-bold block">{enr.course?.title || `كورس #${enr.course_id}`}</span>
                    <span className="text-xs text-muted mt-1">تاريخ الاشتراك: {new Date(enr.enrolled_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${
                    enr.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    enr.status === 'active' ? 'bg-primary/20 text-primary' :
                    'bg-background text-muted'
                  }`}>
                    {enr.status === 'completed' ? 'مكتمل' : enr.status === 'active' ? 'جاري التعلم' : 'موقوف'}
                  </span>
                </div>
              )) : <p className="text-center py-10 text-muted">لا يوجد كورسات</p>}
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {activeTab === 'exams' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4">سجل الامتحانات والنتائج</h2>
            <div className="space-y-3">
              {student.quizAttempts && student.quizAttempts.length > 0 ? student.quizAttempts.map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between bg-background border border-border rounded-xl p-4 hover:border-primary transition-colors">
                  <div>
                    <span className="text-white font-bold block">امتحان #{attempt.quiz_id}</span>
                    <p className="text-xs text-muted mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(attempt.started_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <span className={`text-xl font-bold ${attempt.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(attempt.score)}%
                      </span>
                      <p className="text-xs text-muted">{attempt.passed ? 'ناجح' : 'راسب'}</p>
                    </div>
                    <button
                      onClick={() => setSelectedExam(attempt)}
                      className="bg-primary/20 text-primary hover:bg-primary hover:text-white px-3 py-2 rounded-lg font-bold text-xs transition-colors"
                    >
                      عرض الإجابات
                    </button>
                  </div>
                </div>
              )) : <p className="text-center py-10 text-muted">لا يوجد امتحانات</p>}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-6">النشاط (Timeline)</h2>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {activityLogs && activityLogs.length > 0 ? activityLogs.map((log: any) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {log.action === 'login' ? <User className="w-4 h-4" /> :
                     log.action.includes('video') ? <Video className="w-4 h-4" /> :
                     log.action.includes('quiz') ? <Award className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background p-4 rounded-xl border border-border shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-white">{
                        log.action === 'login' ? 'تسجيل دخول' :
                        log.action === 'started_video' ? 'بدأ مشاهدة فيديو' :
                        log.action === 'completed_video' ? 'أنهى مشاهدة فيديو' :
                        log.action === 'started_quiz' ? 'بدأ امتحان' :
                        log.action === 'submitted_quiz' ? 'سلم امتحان' :
                        log.action === 'downloaded_file' ? 'قام بتحميل ملف' :
                        log.action
                      }</div>
                      <time className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full" dir="ltr">
                        {new Date(log.created_at).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}
                      </time>
                    </div>
                    <div className="text-sm text-muted">
                      {new Date(log.created_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
              )) : <p className="text-center py-10 text-muted">لا يوجد نشاط مسجل</p>}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedExam && (
        <ExamDetailsModal attempt={selectedExam} onClose={() => setSelectedExam(null)} />
      )}
    </div>
  );
};

export default StudentProfilePage;
