import api from './axios';
import type { Course, Module, Video } from '../types';

export const coursesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; published?: boolean }) =>
    api.get<{ courses: Course[]; total: number; pages: number }>('/courses', { params }),

  getById: (id: number | string) =>
    api.get<Course & { modules: (Module & { videos: Video[] })[] }>(`/courses/${id}`),

  create: (data: Partial<Course>) => api.post<Course>('/courses', data),

  update: (id: number | string, data: Partial<Course>) =>
    api.put<Course>(`/courses/${id}`, data),

  delete: (id: number | string) => api.delete(`/courses/${id}`),

  enroll: (courseId: number | string) =>
    api.post('/enrollments', { courseId }),
};

export default coursesApi;
