import React, { useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import VideoPlayer from '../../components/student/VideoPlayer';
import { ArrowRight } from 'lucide-react';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPos = Number(searchParams.get('pos') || 0);

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: () => api.get(`/videos/${id}`).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>لم يتم العثور على الفيديو</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowRight className="w-5 h-5" />
        رجوع
      </button>
      <VideoPlayer
        videoId={video.id}
        url={video.url}
        title={video.title}
        courseName={video.courseName}
        initialPosition={initialPos}
      />
    </div>
  );
};

export default VideoPlayerPage;
