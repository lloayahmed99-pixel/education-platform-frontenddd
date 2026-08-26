import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import VideoPlayer from '../../components/student/VideoPlayer';
import { ArrowRight, PlayCircle, Lock, BookOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data),
    onSuccess: (data: any) => {
      if (data.modules?.[0]?.videos?.[0]) {
        setActiveVideo(data.modules[0].videos[0]);
      }
    },
  } as any);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const getAllVideos = () => {
    if (!course?.modules) return [];
    return course.modules.flatMap((m: any) => m.videos || []);
  };

  const getNextVideo = () => {
    const all = getAllVideos();
    const idx = all.findIndex((v: any) => v.id === activeVideo?.id);
    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-card rounded-xl w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card rounded-2xl" />
          <div className="h-96 bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-muted">
        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>لم يتم العثور على الكورس</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student/courses')}
          className="text-muted hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">{course.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          {activeVideo ? (
            <VideoPlayer
              videoId={activeVideo.id}
              url={activeVideo.url}
              title={activeVideo.title}
              courseName={course.title}
              onNext={() => {
                const next = getNextVideo();
                if (next) setActiveVideo(next);
              }}
            />
          ) : (
            <div className="bg-card rounded-2xl border border-border flex items-center justify-center h-64">
              <div className="text-center text-muted">
                <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>اختر فيديو للمشاهدة</p>
              </div>
            </div>
          )}

          {/* Course Info */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-white mb-2">{course.title}</h2>
            {course.description && <p className="text-muted text-sm leading-relaxed">{course.description}</p>}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration_hours} ساعة
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course.modules?.length || 0} وحدة
              </span>
            </div>
          </div>
        </div>

        {/* Modules Sidebar */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-lg">محتوى الكورس</h3>
          {course.modules?.map((module: any, idx: number) => (
            <div key={module.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggleModule(idx)}
                className="w-full flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
              >
                <span className="font-semibold text-white text-sm">{module.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{module.videos?.length || 0} فيديو</span>
                  {expandedModules.includes(idx)
                    ? <ChevronUp className="w-4 h-4 text-muted" />
                    : <ChevronDown className="w-4 h-4 text-muted" />
                  }
                </div>
              </button>
              {expandedModules.includes(idx) && (
                <div className="border-t border-border">
                  {module.videos?.map((video: any) => (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-background/50 transition-colors text-right ${
                        activeVideo?.id === video.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                      }`}
                    >
                      <PlayCircle className={`w-4 h-4 flex-shrink-0 ${activeVideo?.id === video.id ? 'text-primary' : 'text-muted'}`} />
                      <span className={`text-sm flex-1 ${activeVideo?.id === video.id ? 'text-primary font-semibold' : 'text-muted'}`}>
                        {video.title}
                      </span>
                      {video.duration_seconds && (
                        <span className="text-xs text-muted flex-shrink-0">
                          {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
