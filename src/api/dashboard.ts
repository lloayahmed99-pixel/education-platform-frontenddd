import api from './axios';
import type { DashboardStats, AdminDashboardStats } from '../types';

export const dashboardApi = {
  getStudentDashboard: () => api.get<DashboardStats>('/dashboard/student'),
  getAdminDashboard: () => api.get<AdminDashboardStats>('/dashboard/admin'),
  getModeratorDashboard: () => api.get<any>('/dashboard/moderator'),
};

export default dashboardApi;
