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
        <div className="h-10 bg-gray-200 rounded-xl w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
          <div className="h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-gray-500">
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
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>اختر فيديو للمشاهدة</p>
              </div>
            </div>
          )}

          {/* Course Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h2>
            {course.description && <p className="text-gray-500 text-sm leading-relaxed">{course.description}</p>}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
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
          <h3 className="font-bold text-gray-900 text-lg">محتوى الكورس</h3>
          {course.modules?.map((module: any, idx: number) => (
            <div key={module.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleModule(idx)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-sm">{module.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{module.videos?.length || 0} فيديو</span>
                  {expandedModules.includes(idx)
                    ? <ChevronUp className="w-4 h-4 text-gray-500" />
                    : <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </div>
              </button>
              {expandedModules.includes(idx) && (
                <div className="border-t border-gray-200">
                  {module.videos?.map((video: any) => (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-right ${
                        activeVideo?.id === video.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : ''
                      }`}
                    >
                      <PlayCircle className={`w-4 h-4 flex-shrink-0 ${activeVideo?.id === video.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className={`text-sm flex-1 ${activeVideo?.id === video.id ? 'text-indigo-600 font-semibold' : 'text-gray-500'}`}>
                        {video.title}
                      </span>
                      {video.duration_seconds && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
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
