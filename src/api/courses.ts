import api from './axios';
import type { Course, Module, Video } from '../types';

export const coursesApi = {
  // Public / Student
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: Course[]; total: number; page: number; totalPages: number }>('/courses', { params }),

  getById: (id: number | string) =>
    api.get<Course & { modules: (Module & { videos: Video[] })[] }>(`/courses/${id}`),

  enroll: (courseId: number | string) =>
    api.post(`/courses/${courseId}/enroll`),

  // Admin (Uses /admin/courses from backend)
  getAllAdmin: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ courses: Course[]; total: number; pages: number }>('/admin/courses', { params }),

  create: (data: Partial<Course>) => api.post<Course>('/admin/courses', data),
  
  update: (id: number | string, data: Partial<Course>) =>
    api.put<Course>(`/admin/courses/${id}`, data),
    
  delete: (id: number | string) => api.delete(`/admin/courses/${id}`),

  // Admin Modules
  createModule: (courseId: number | string, data: Partial<Module>) =>
    api.post<Module>(`/admin/courses/${courseId}/modules`, data),

  updateModule: (courseId: number | string, moduleId: number | string, data: Partial<Module>) =>
    api.put<Module>(`/admin/courses/${courseId}/modules/${moduleId}`, data),

  deleteModule: (courseId: number | string, moduleId: number | string) =>
    api.delete(`/admin/courses/${courseId}/modules/${moduleId}`),

  // Admin Videos
  createVideo: (courseId: number | string, moduleId: number | string, data: Partial<Video>) =>
    api.post<Video>(`/admin/courses/${courseId}/modules/${moduleId}/videos`, data),

  updateVideo: (courseId: number | string, moduleId: number | string, videoId: number | string, data: Partial<Video>) =>
    api.put<Video>(`/admin/courses/${courseId}/modules/${moduleId}/videos/${videoId}`, data),

  deleteVideo: (courseId: number | string, moduleId: number | string, videoId: number | string) =>
    api.delete(`/admin/courses/${courseId}/modules/${moduleId}/videos/${videoId}`),
};

export default coursesApi;
