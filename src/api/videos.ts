import api from './axios';
import type { Video, VideoProgress } from '../types';

export const videosApi = {
  getById: (id: number | string) => api.get<Video>(`/videos/${id}`),
  create: (data: Partial<Video>) => api.post<Video>('/videos', data),
  update: (id: number | string, data: Partial<Video>) => api.put<Video>(`/videos/${id}`, data),
  delete: (id: number | string) => api.delete(`/videos/${id}`),
};

export const progressApi = {
  getLatest: () => api.get<VideoProgress>('/progress/latest'),
  getByVideo: (videoId: number | string) =>
    api.get<VideoProgress>(`/progress/${videoId}`),
  update: (
    videoId: number | string,
    data: { currentPosition: number; duration: number; completionPercentage: number; completed: boolean }
  ) => api.put<VideoProgress>(`/progress/${videoId}`, data),
};

export const savedVideosApi = {
  getAll: () => api.get<Video[]>('/saved-videos'),
  toggle: (videoId: number | string) => api.post(`/saved-videos/${videoId}`),
};

export default videosApi;
