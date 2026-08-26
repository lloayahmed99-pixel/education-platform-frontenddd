import api from './axios';
import type { Notification } from '../types';

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications'),
  markRead: (id: number | string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  send: (data: { title: string; message: string; type: string; userId?: number; isGlobal?: boolean }) =>
    api.post('/notifications', data),
};

export default notificationsApi;
