import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Trash2, PlayCircle, Clock, BookOpen } from 'lucide-react';
import { savedVideosApi } from '../../api/videos';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SavedVideosPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['savedVideos'],
    queryFn: () => savedVideosApi.getAll().then(r => r.data),
  });

  const unsaveMutation = useMutation({
    mutationFn: (videoId: number | string) => savedVideosApi.toggle(videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savedVideos'] });
      qc.invalidateQueries({ queryKey: ['studentDashboard'] });
      toast.success('تم إلغاء حفظ الفيديو');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const formatDuration = (secs?: number) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Bookmark className="w-7 h-7 text-primary" />
        الفيديوهات المحفوظة
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-card rounded-2xl border border-border" />
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => (
            <div key={video.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-colors group">
              <div className="relative h-36 bg-background">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-10 h-10 text-muted" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => navigate(`/student/video/${video.id}`)}
                    className="bg-primary text-white rounded-full p-3"
                  >
                    <PlayCircle className="w-6 h-6" />
                  </button>
                </div>
                {video.duration_seconds && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {formatDuration(video.duration_seconds)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{video.title}</h3>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/student/video/${video.id}`)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <PlayCircle className="w-3 h-3" />
                    مشاهدة
                  </button>
                  <button
                    onClick={() => unsaveMutation.mutate(video.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    إلغاء الحفظ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">لا توجد فيديوهات محفوظة</p>
          <p className="text-sm mt-2">احفظ الفيديوهات المفضلة أثناء المشاهدة</p>
        </div>
      )}
    </div>
  );
};

export default SavedVideosPage;
