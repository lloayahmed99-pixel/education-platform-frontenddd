import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { ArrowRight, User, BookOpen, Video, Award, Clock, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ['adminStudent', id],
    queryFn: () => adminApi.getStudentById(id!).then(r => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateStudentStatus(id!, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminStudent', id] }); toast.success('تم التحديث'); },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-white border border-gray-200 rounded-xl w-32 shadow-sm" />
        <div className="h-48 bg-white border border-gray-200 rounded-2xl shadow-sm" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white border border-gray-200 rounded-2xl shadow-sm" />)}
        </div>
      </div>
    );
  }

  if (!student) return <div className="text-center py-20 text-gray-500">الطالب غير موجود</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowRight className="w-5 h-5" />
        رجوع للطلاب
      </button>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-wrap items-start gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 text-2xl font-bold">
          {student.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-500 text-sm" dir="ltr">{student.email}</p>
          
          {((student as any)?.phone || (student as any)?.parent_phone) && (
            <div className="mt-2 space-y-1">
              {(student as any)?.phone && (
                <p className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs ml-2">هاتف الطالب:</span> 
                  <span dir="ltr">{(student as any).phone}</span>
                </p>
              )}
              {(student as any)?.parent_phone && (
                <p className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs ml-2">هاتف ولي الأمر:</span> 
                  <span dir="ltr">{(student as any).parent_phone}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-3 flex-wrap">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              student.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
              student.status === 'suspended' ? 'bg-red-50 text-red-500' :
              'bg-gray-100 text-gray-500'
            }`}>
              {student.status === 'active' ? 'نشط' : student.status === 'suspended' ? 'موقوف' : 'غير نشط'}
            </span>
            <span className="text-xs text-gray-500">
              عضو منذ {new Date(student.created_at!).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {student.status === 'active' ? (
            <button
              onClick={() => statusMutation.mutate('suspended')}
              className="flex items-center gap-2 border border-amber-300 text-amber-600 px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors text-sm font-semibold"
            >
              <UserX className="w-4 h-4" />
              تعليق
            </button>
          ) : (
            <button
              onClick={() => statusMutation.mutate('active')}
              className="flex items-center gap-2 border border-emerald-300 text-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors text-sm font-semibold"
            >
              <UserCheck className="w-4 h-4" />
              تفعيل
            </button>
          )}
        </div>
      </div>

      {/* Enrollments */}
      {student.enrollments && student.enrollments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            الكورسات المسجّل فيها ({student.enrollments.length})
          </h2>
          <div className="space-y-3">
            {student.enrollments.map((enr: any) => (
              <div key={enr.id} className="flex items-center justify-between bg-[#f4f7fe] border border-gray-100 rounded-xl p-4">
                <span className="text-gray-900 font-semibold text-sm">{enr.course?.title || `كورس #${enr.course_id}`}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  enr.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                  enr.status === 'active' ? 'bg-indigo-100 text-indigo-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {enr.status === 'completed' ? 'مكتمل' : enr.status === 'active' ? 'جاري' : 'موقوف'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Attempts */}
      {student.quizAttempts && student.quizAttempts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            نتائج الاختبارات ({student.quizAttempts.length})
          </h2>
          <div className="space-y-3">
            {student.quizAttempts.map((attempt: any) => (
              <div key={attempt.id} className="flex items-center justify-between bg-[#f4f7fe] border border-gray-100 rounded-xl p-4">
                <div>
                  <span className="text-gray-900 font-semibold text-sm">اختبار #{attempt.quiz_id}</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(attempt.started_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="text-left">
                  <span className={`text-lg font-bold ${attempt.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                    {Math.round(attempt.score)}%
                  </span>
                  <p className="text-xs text-gray-500">{attempt.passed ? 'ناجح' : 'راسب'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Progress */}
      {student.videoProgress && student.videoProgress.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600" />
            سجل مشاهدات الفيديوهات ({student.videoProgress.length})
          </h2>
          <div className="space-y-3">
            {student.videoProgress.map((prog: any) => (
              <div key={prog.id} className="flex items-center justify-between bg-[#f4f7fe] border border-gray-100 rounded-xl p-4">
                <div>
                  <span className="text-gray-900 font-semibold text-sm">{prog.video_title}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{prog.course_title}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    آخر مشاهدة: {new Date(prog.last_watched_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="text-left flex flex-col items-end gap-2">
                  <span className={`text-sm font-bold ${prog.completed ? 'text-emerald-600' : 'text-indigo-600'}`}>
                    {Math.round(prog.completion_percentage)}%
                  </span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${prog.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(100, Math.max(0, prog.completion_percentage))}%` }}
                    />
                  </div>
                  {prog.completed && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">مكتمل</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
