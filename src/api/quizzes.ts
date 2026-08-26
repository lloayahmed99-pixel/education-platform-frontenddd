import api from './axios';
import type { Quiz, QuizAttempt } from '../types';

export const quizzesApi = {
  getById: (id: number | string) => api.get<Quiz>(`/quizzes/${id}`),
  create: (data: Partial<Quiz>) => api.post<Quiz>('/quizzes', data),
  update: (id: number | string, data: Partial<Quiz>) => api.put<Quiz>(`/quizzes/${id}`, data),
  delete: (id: number | string) => api.delete(`/quizzes/${id}`),
  submitAttempt: (id: number | string, answers: Record<string, number>) =>
    api.post<{ score: number; passed: boolean; correctCount: number; totalQuestions: number }>(
      `/quizzes/${id}/attempts`,
      { answers }
    ),
  getMyAttempts: (id: number | string) =>
    api.get<QuizAttempt[]>(`/quizzes/${id}/attempts/mine`),
};

export default quizzesApi;
