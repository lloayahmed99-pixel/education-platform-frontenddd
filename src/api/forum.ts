import api from './axios';
import type { ForumPost, ForumComment } from '../types';

export const forumApi = {
  getPosts: (params?: { page?: number; limit?: number }) =>
    api.get<{ posts: ForumPost[]; total: number; pages: number }>('/forum/posts', { params }),
  getPostById: (id: number | string) =>
    api.get<ForumPost & { comments: ForumComment[] }>(`/forum/posts/${id}`),
  createPost: (data: { title: string; content: string }) =>
    api.post<ForumPost>('/forum/posts', data),
  updatePost: (id: number | string, data: Partial<ForumPost>) =>
    api.put<ForumPost>(`/forum/posts/${id}`, data),
  deletePost: (id: number | string) => api.delete(`/forum/posts/${id}`),
  createComment: (postId: number | string, content: string) =>
    api.post<ForumComment>(`/forum/posts/${postId}/comments`, { content }),
  deleteComment: (id: number | string) => api.delete(`/forum/comments/${id}`),
  report: (data: { target_type: string; target_id: number; reason: string }) =>
    api.post('/reports', data),
  getReports: (params?: { page?: number; status?: string }) =>
    api.get('/reports', { params }),
  updateReport: (id: number | string, status: string) =>
    api.put(`/reports/${id}`, { status }),
};

export default forumApi;
