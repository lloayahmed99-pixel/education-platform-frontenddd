import React, { useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';
import { progressApi, savedVideosApi } from '../../api/videos';
import toast from 'react-hot-toast';

interface VideoPlayerProps {
  videoId: string | number;
  url: string;
  title: string;
  courseName?: string;
  initialPosition?: number;
  onNext?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  url,
  title,
  courseName,
  initialPosition = 0,
  onNext,
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSeekRef = useRef(false);
  const currentPosRef = useRef(initialPosition);
  const durationRef = useRef(0);
  const [isSaved, setIsSaved] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // Load saved state
  useEffect(() => {
    progressApi.getByVideo(videoId).then(res => {
      if (res.data) {
        currentPosRef.current = res.data.current_position || initialPosition;
        setIsSaved(false); // will be overridden
      }
    }).catch(() => {});
  }, [videoId, initialPosition]);

  const saveProgress = useCallback((completed = false) => {
    const pos = currentPosRef.current;
    const dur = durationRef.current;
    if (dur <= 0) return;
    const pct = Math.min((pos / dur) * 100, 100);
    progressApi.update(videoId, {
      currentPosition: pos,
      duration: dur,
      completionPercentage: pct,
      completed: completed || pct >= 95,
    }).catch(() => {});
  }, [videoId]);

  // Auto-save every 10 seconds
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => saveProgress(), 10000);
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      saveProgress();
    };
  }, [saveProgress]);

  const handleReady = () => {
    setReady(true);
    if (!hasSeekRef.current && currentPosRef.current > 0) {
      playerRef.current?.seekTo(currentPosRef.current, 'seconds');
      hasSeekRef.current = true;
    }
  };

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    currentPosRef.current = playedSeconds;
  };

  const handleDuration = (dur: number) => {
    durationRef.current = dur;
  };

  const handlePause = () => saveProgress();

  const handleEnded = () => saveProgress(true);

  const toggleSave = async () => {
    try {
      await savedVideosApi.toggle(videoId);
      setIsSaved(prev => !prev);
      toast.success(isSaved ? 'تم إلغاء الحفظ' : 'تم حفظ الفيديو');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-2 text-sm">
        {courseName && <span className="text-primary font-semibold">{courseName}</span>}
        {courseName && <ArrowRight className="w-4 h-4 text-muted" />}
        <span className="text-white font-bold">{title}</span>
      </div>

      {/* Player */}
      <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
        <div className="absolute inset-0">
          <ReactPlayer
            ref={playerRef}
            url={url}
            width="100%"
            height="100%"
            controls
            onReady={handleReady}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onPause={handlePause}
            onEnded={handleEnded}
            config={{
              youtube: { playerVars: { modestbranding: 1 } },
            }}
          />
        </div>
      </div>

      {/* Controls bar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors text-sm font-semibold ${
              isSaved
                ? 'bg-primary/20 border-primary text-primary'
                : 'border-border text-muted hover:border-primary hover:text-white'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? 'محفوظ' : 'حفظ الفيديو'}
          </button>
        </div>
        {onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-white font-bold text-sm hover:bg-amber-500 transition-colors"
          >
            الدرس التالي
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
