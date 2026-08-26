import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, Star, Users, Tag } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import coursesApi from '../../api/courses';
import toast from 'react-hot-toast';

interface CourseCardProps {
  course: {
    id: string | number;
    title: string;
    description?: string;
    instructor?: string;
    thumbnail?: string;
    price: number;
    rating?: number;
    students_count?: number;
    studentsCount?: number;
    duration_hours?: number;
    duration?: number;
    isEnrolled?: boolean;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const studentsCount = course.students_count ?? course.studentsCount ?? 0;
  const durationHours = course.duration_hours ?? (course.duration ? Math.floor(course.duration / 60) : 0);

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(course.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studentDashboard'] });
      qc.invalidateQueries({ queryKey: ['recommendedCourses'] });
      toast.success('تم الاشتراك في الكورس بنجاح!');
      navigate(`/student/courses/${course.id}`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'حدث خطأ في الاشتراك'),
  });

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/60 transition-all duration-300 group shadow-lg hover:shadow-primary/10 flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-background flex-shrink-0">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-muted/40" />
          </div>
        )}
        {/* Price Badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary">
          {course.price > 0 ? `${course.price} ج.م` : 'مجاني'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-white mb-1 line-clamp-2 leading-snug">{course.title}</h3>

        {course.instructor && (
          <p className="text-muted text-sm mb-2 font-medium">{course.instructor}</p>
        )}

        {course.description && (
          <p className="text-muted/80 text-xs mb-3 line-clamp-2 leading-relaxed">{course.description}</p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted mb-4 mt-auto">
          {course.rating && course.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-primary fill-current" />
              <span>{course.rating.toFixed(1)}</span>
            </div>
          )}
          {studentsCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{studentsCount.toLocaleString('ar-EG')}</span>
            </div>
          )}
          {durationHours > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{durationHours} ساعة</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/student/courses/${course.id}`)}
            className="w-full border border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            الدخول للكورس
          </button>
          {!course.isEnrolled && (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="w-full bg-primary hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {enrollMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Tag className="w-4 h-4" />
              )}
              الاشتراك في الكورس!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
