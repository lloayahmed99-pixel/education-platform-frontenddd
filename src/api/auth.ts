import api from './axios';
import type { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { name, email, password }),
  me: () => api.get<User>('/auth/me'),
};

export default authApi;
