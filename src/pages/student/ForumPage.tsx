import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '../../api/forum';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, Plus, Eye, Clock, Flag, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ForumPage = () => {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['forumPosts', page],
    queryFn: () => forumApi.getPosts({ page, limit: 10 }).then(r => r.data),
  });

  const { data: postDetail } = useQuery({
    queryKey: ['forumPost', selectedPost?.id],
    queryFn: () => selectedPost ? forumApi.getPostById(selectedPost.id).then(r => r.data) : null,
    enabled: !!selectedPost,
  });

  const createMutation = useMutation({
    mutationFn: () => forumApi.createPost(newPost),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forumPosts'] });
      setShowNewPost(false);
      setNewPost({ title: '', content: '' });
      toast.success('تم نشر المقال بنجاح');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const commentMutation = useMutation({
    mutationFn: () => forumApi.createComment(selectedPost?.id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forumPost', selectedPost?.id] });
      setComment('');
      toast.success('تم إضافة التعليق');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => forumApi.deletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forumPosts'] });
      setSelectedPost(null);
      toast.success('تم حذف المقال');
    },
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-indigo-600" />
          المنتدى
        </h1>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          مقال جديد
        </button>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">مقال جديد</h2>
              <button onClick={() => setShowNewPost(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                value={newPost.title}
                onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                placeholder="عنوان المقال"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600"
              />
              <textarea
                value={newPost.content}
                onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                placeholder="محتوى المقال..."
                rows={5}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 resize-none"
              />
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !newPost.title || !newPost.content}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
              >
                {createMutation.isPending ? 'جاري النشر...' : 'نشر المقال'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && postDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
              <h2 className="text-lg font-bold text-gray-900 flex-1 ml-2">{postDetail.title}</h2>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-700 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="font-semibold text-indigo-600">{postDetail.author?.name}</span>
                  <span>·</span>
                  <span>{formatDate(postDetail.created_at)}</span>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{postDetail.content}</p>
              </div>
              {/* Comments */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">التعليقات ({postDetail.comments?.length || 0})</h3>
                <div className="space-y-3 mb-4">
                  {postDetail.comments?.map((c: any) => (
                    <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-indigo-600 font-semibold">{c.author?.name}</span>
                        <span className="text-xs text-gray-500">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="أضف تعليقاً..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 text-sm"
                  />
                  <button
                    onClick={() => commentMutation.mutate()}
                    disabled={!comment || commentMutation.isPending}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-sm"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl border border-gray-200" />)}
        </div>
      ) : data?.posts && data.posts.length > 0 ? (
        <div className="space-y-3">
          {data.posts.map((post: any) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-indigo-400 transition-colors cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1 hover:text-indigo-600 transition-colors truncate">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{post.content}</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(post.id); }}
                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="text-indigo-600 font-semibold">{post.author?.name}</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {post.comments_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(post.created_at)}
                </span>
              </div>
            </div>
          ))}
          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg font-bold transition-colors ${p === page ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا توجد مقالات بعد</p>
          <p className="text-sm mt-2">كن أول من يكتب مقالاً!</p>
        </div>
      )}
    </div>
  );
};

export default ForumPage;
