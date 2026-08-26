import api from './axios';
import type { User, Moderator, Course, Video, QuizAttempt, Enrollment, ActivityLog, VideoProgress } from '../types';

export const adminApi = {
  // Students
  getStudents: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<{ students: User[]; total: number; pages: number }>('/admin/students', { params }),
  getStudentById: (id: number | string) =>
    api.get<User & {
      enrollments: Enrollment[];
      videoProgress: VideoProgress[];
      quizAttempts: QuizAttempt[];
    }>(`/admin/students/${id}`),
  createStudent: (data: Partial<User> & { password: string }) =>
    api.post<User>('/admin/students', data),
  updateStudent: (id: number | string, data: Partial<User>) =>
    api.put<User>(`/admin/students/${id}`, data),
  deleteStudent: (id: number | string) => api.delete(`/admin/students/${id}`),
  updateStudentStatus: (id: number | string, status: string) =>
    api.patch(`/admin/students/${id}/status`, { status }),

  // Moderators
  getModerators: () => api.get<Moderator[]>('/admin/moderators'),
  createModerator: (data: { name: string; email: string; password: string }) =>
    api.post<Moderator>('/admin/moderators', data),
  updateModerator: (id: number | string, data: any) =>
    api.put<Moderator>(`/admin/moderators/${id}`, data),
  deleteModerator: (id: number | string) => api.delete(`/admin/moderators/${id}`),
  getModeratorPermissions: (id: number | string) =>
    api.get<string[]>(`/admin/moderators/${id}/permissions`),
  updateModeratorPermissions: (id: number | string, permissions: string[]) =>
    api.put(`/admin/moderators/${id}/permissions`, { permissions }),

  // Enrollments
  getEnrollments: (params?: any) =>
    api.get<{ enrollments: Enrollment[]; total: number }>('/admin/enrollments', { params }),
  createEnrollment: (data: { studentId: number; courseId: number }) =>
    api.post('/admin/enrollments', data),
  deleteEnrollment: (id: number | string) => api.delete(`/admin/enrollments/${id}`),

  // Activity Logs
  getLogs: (params?: { page?: number; limit?: number }) =>
    api.get<{ logs: ActivityLog[]; total: number }>('/admin/logs', { params }),
};

export const moderatorApi = {
  getStudents: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ students: User[]; total: number }>('/moderator/students', { params }),
  getStudentById: (id: number | string) =>
    api.get<User>(`/moderator/students/${id}`),
  updateStudentStatus: (id: number | string, status: string) =>
    api.patch(`/moderator/students/${id}/status`, { status }),
};

export default adminApi;
