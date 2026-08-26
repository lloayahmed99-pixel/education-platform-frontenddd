import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import coursesApi from '../../api/courses';
import { ArrowRight, Plus, Edit, Trash2, GripVertical, Play, Video, List, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';

const CourseContentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeModule, setActiveModule] = useState<any>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: '', order_index: 0 });

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', url: '', thumbnail: '', duration_seconds: 0, order_index: 0 });

  const { data: course, isLoading } = useQuery({
    queryKey: ['adminCourseContent', id],
    queryFn: () => coursesApi.getById(id!).then(r => r.data),
  });

  // Module Mutations
  const moduleMutation = useMutation({
    mutationFn: () => activeModule
      ? coursesApi.updateModule(id!, activeModule.id, moduleForm)
      : coursesApi.createModule(id!, moduleForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCourseContent', id] });
      setShowModuleForm(false);
      setActiveModule(null);
      toast.success('تم الحفظ بنجاح');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: number) => coursesApi.deleteModule(id!, moduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCourseContent', id] });
      toast.success('تم الحذف');
    },
  });

  // Video Mutations
  const videoMutation = useMutation({
    mutationFn: () => activeVideo
      ? coursesApi.updateVideo(id!, activeModule.id, activeVideo.id, videoForm)
      : coursesApi.createVideo(id!, activeModule.id, videoForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCourseContent', id] });
      setShowVideoForm(false);
      setActiveVideo(null);
      toast.success('تم الحفظ بنجاح');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteVideoMutation = useMutation({
    mutationFn: ({ moduleId, videoId }: { moduleId: number, videoId: number }) => coursesApi.deleteVideo(id!, moduleId, videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCourseContent', id] });
      toast.success('تم الحذف');
    },
  });

  if (isLoading) return <div className="text-center py-20 text-muted animate-pulse">جاري التحميل...</div>;
  if (!course) return <div className="text-center py-20 text-muted">الكورس غير موجود</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/courses')} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
          العودة للكورسات
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">إدارة محتوى: {course.title}</h1>
        <p className="text-muted text-sm">أضف ورتب الوحدات والدروس الخاصة بهذا الكورس.</p>
        
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <List className="w-5 h-5 text-primary" />
              الوحدات والدروس
            </h2>
            <button
              onClick={() => { setActiveModule(null); setModuleForm({ title: '', order_index: course.modules?.length || 0 }); setShowModuleForm(true); }}
              className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-colors font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> إضافة وحدة جديدة
            </button>
          </div>

          <div className="space-y-6">
            {course.modules?.map((mod: any, index: number) => (
              <div key={mod.id} className="bg-background border border-border rounded-2xl overflow-hidden">
                {/* Module Header */}
                <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-muted cursor-grab" />
                    <h3 className="font-bold text-white text-lg">{mod.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setActiveModule(mod); setVideoForm({ title: '', description: '', url: '', thumbnail: '', duration_seconds: 0, order_index: mod.videos?.length || 0 }); setShowVideoForm(true); }}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-500 transition-colors">
                      <Plus className="w-3 h-3" /> درس جديد
                    </button>
                    <button onClick={() => { setActiveModule(mod); setModuleForm({ title: mod.title, order_index: mod.order_index }); setShowModuleForm(true); }}
                      className="text-blue-400 hover:text-blue-300 p-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if(confirm('هل أنت متأكد من حذف الوحدة بجميع فيديوهاتها؟')) deleteModuleMutation.mutate(mod.id); }}
                      className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Videos List */}
                <div className="p-4 space-y-2">
                  {mod.videos?.length === 0 ? (
                    <p className="text-muted text-sm text-center py-4">لا توجد دروس في هذه الوحدة.</p>
                  ) : (
                    mod.videos?.map((vid: any) => (
                      <div key={vid.id} className="flex items-center justify-between bg-card/50 border border-border rounded-xl p-3 hover:bg-card transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">{vid.title}</h4>
                            <p className="text-xs text-muted mt-0.5">{Math.round(vid.duration_seconds / 60)} دقيقة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setActiveModule(mod); setActiveVideo(vid); setVideoForm({ title: vid.title, description: vid.description || '', url: vid.url, thumbnail: vid.thumbnail || '', duration_seconds: vid.duration_seconds, order_index: vid.order_index }); setShowVideoForm(true); }}
                            className="text-blue-400 hover:text-blue-300 p-2"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if(confirm('حذف هذا الدرس؟')) deleteVideoMutation.mutate({ moduleId: mod.id, videoId: vid.id }); }}
                            className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            {course.modules?.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <Video className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted">لم يتم إضافة أي وحدات دراسية بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">{activeModule ? 'تعديل الوحدة' : 'وحدة جديدة'}</h2>
              <button onClick={() => setShowModuleForm(false)}><X className="w-5 h-5 text-muted hover:text-white" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted font-semibold block mb-2">اسم الوحدة</label>
                <input type="text" value={moduleForm.title} onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" placeholder="مثال: الباب الأول" />
              </div>
              <button onClick={() => moduleMutation.mutate()} disabled={moduleMutation.isPending || !moduleForm.title}
                className="w-full bg-primary hover:bg-amber-500 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {moduleMutation.isPending ? 'جاري الحفظ...' : 'حفظ الوحدة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Form Modal */}
      {showVideoForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">{activeVideo ? 'تعديل الدرس' : 'درس جديد'}</h2>
              <button onClick={() => setShowVideoForm(false)}><X className="w-5 h-5 text-muted hover:text-white" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted font-semibold block mb-2">عنوان الدرس</label>
                <input type="text" value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted font-semibold block mb-2">رابط الفيديو (من أي منصة)</label>
                <input type="url" value={videoForm.url} onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))} dir="ltr"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-left" placeholder="https://..." />
                <p className="text-xs text-muted mt-1">يدعم YouTube, Vimeo, Drive، أو أي رابط مباشر MP4.</p>
              </div>
              
              <ImageUpload
                label="الصورة المصغرة للدرس (اختياري)"
                value={videoForm.thumbnail}
                onChange={(url) => setVideoForm(p => ({ ...p, thumbnail: url }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted font-semibold block mb-2">المدة (ثواني)</label>
                  <input type="number" value={videoForm.duration_seconds} onChange={e => setVideoForm(p => ({ ...p, duration_seconds: Number(e.target.value) }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted font-semibold block mb-2">الترتيب</label>
                  <input type="number" value={videoForm.order_index} onChange={e => setVideoForm(p => ({ ...p, order_index: Number(e.target.value) }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted font-semibold block mb-2">وصف قصير (اختياري)</label>
                <textarea value={videoForm.description} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary resize-none" />
              </div>

              <button onClick={() => videoMutation.mutate()} disabled={videoMutation.isPending || !videoForm.title || !videoForm.url}
                className="w-full bg-primary hover:bg-amber-500 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {videoMutation.isPending ? 'جاري الحفظ...' : 'حفظ الدرس'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseContentPage;
