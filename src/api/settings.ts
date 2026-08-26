import api from './axios';

export const settingsApi = {
  getAll: () => api.get<Record<string, string>>('/settings'),
  updateMany: (settings: Record<string, string>) => api.put('/settings', { settings }),
};

export default settingsApi;
