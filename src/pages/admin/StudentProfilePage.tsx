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
        <div className="h-10 bg-card rounded-xl w-32" />
        <div className="h-48 bg-card rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-card rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!student) return <div className="text-center py-20 text-muted">الطالب غير موجود</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
        <ArrowRight className="w-5 h-5" />
        رجوع للطلاب
      </button>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-wrap items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-2xl font-bold">
          {student.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{student.name}</h1>
          <p className="text-muted text-sm" dir="ltr">{student.email}</p>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              student.status === 'active' ? 'bg-green-400/20 text-green-400' :
              student.status === 'suspended' ? 'bg-red-400/20 text-red-400' :
              'bg-gray-400/20 text-gray-400'
            }`}>
              {student.status === 'active' ? 'نشط' : student.status === 'suspended' ? 'موقوف' : 'غير نشط'}
            </span>
            <span className="text-xs text-muted">
              عضو منذ {new Date(student.created_at!).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {student.status === 'active' ? (
            <button
              onClick={() => statusMutation.mutate('suspended')}
              className="flex items-center gap-2 border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-xl hover:bg-yellow-400/10 transition-colors text-sm font-semibold"
            >
              <UserX className="w-4 h-4" />
              تعليق
            </button>
          ) : (
            <button
              onClick={() => statusMutation.mutate('active')}
              className="flex items-center gap-2 border border-green-500/50 text-green-400 px-4 py-2 rounded-xl hover:bg-green-400/10 transition-colors text-sm font-semibold"
            >
              <UserCheck className="w-4 h-4" />
              تفعيل
            </button>
          )}
        </div>
      </div>

      {/* Enrollments */}
      {student.enrollments && student.enrollments.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            الكورسات المسجّل فيها ({student.enrollments.length})
          </h2>
          <div className="space-y-3">
            {student.enrollments.map((enr: any) => (
              <div key={enr.id} className="flex items-center justify-between bg-background rounded-xl p-4">
                <span className="text-white font-semibold text-sm">{enr.course?.title || `كورس #${enr.course_id}`}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  enr.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                  enr.status === 'active' ? 'bg-primary/20 text-primary' :
                  'bg-gray-400/20 text-gray-400'
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
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            نتائج الاختبارات ({student.quizAttempts.length})
          </h2>
          <div className="space-y-3">
            {student.quizAttempts.map((attempt: any) => (
              <div key={attempt.id} className="flex items-center justify-between bg-background rounded-xl p-4">
                <div>
                  <span className="text-white font-semibold text-sm">اختبار #{attempt.quiz_id}</span>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(attempt.started_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="text-left">
                  <span className={`text-lg font-bold ${attempt.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.round(attempt.score)}%
                  </span>
                  <p className="text-xs text-muted">{attempt.passed ? 'ناجح' : 'راسب'}</p>
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
