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

  if (isLoading) return <div className="text-center py-20 text-gray-500 animate-pulse">جاري التحميل...</div>;
  if (!course) return <div className="text-center py-20 text-gray-500">الكورس غير موجود</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/courses')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowRight className="w-5 h-5" />
          العودة للكورسات
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة محتوى: {course.title}</h1>
        <p className="text-gray-500 text-sm">أضف ورتب الوحدات والدروس الخاصة بهذا الكورس.</p>
        
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-600" />
              الوحدات والدروس
            </h2>
            <button
              onClick={() => { setActiveModule(null); setModuleForm({ title: '', order_index: course.modules?.length || 0 }); setShowModuleForm(true); }}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl transition-colors font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> إضافة وحدة جديدة
            </button>
          </div>

          <div className="space-y-6">
            {course.modules?.map((mod: any, index: number) => (
              <div key={mod.id} className="bg-[#f4f7fe] border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Module Header */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                    <h3 className="font-bold text-gray-900 text-lg">{mod.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setActiveModule(mod); setVideoForm({ title: '', description: '', url: '', thumbnail: '', duration_seconds: 0, order_index: mod.videos?.length || 0 }); setShowVideoForm(true); }}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm">
                      <Plus className="w-3 h-3" /> درس جديد
                    </button>
                    <button onClick={() => { setActiveModule(mod); setModuleForm({ title: mod.title, order_index: mod.order_index }); setShowModuleForm(true); }}
                      className="text-blue-600 hover:text-blue-700 p-2 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if(confirm('هل أنت متأكد من حذف الوحدة بجميع فيديوهاتها؟')) deleteModuleMutation.mutate(mod.id); }}
                      className="text-red-500 hover:text-red-600 p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Videos List */}
                <div className="p-4 space-y-2">
                  {mod.videos?.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">لا توجد دروس في هذه الوحدة.</p>
                  ) : (
                    mod.videos?.map((vid: any) => (
                      <div key={vid.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                          </div>
                          <div>
                            <h4 className="text-gray-900 font-semibold text-sm">{vid.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{Math.round(vid.duration_seconds / 60)} دقيقة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setActiveModule(mod); setActiveVideo(vid); setVideoForm({ title: vid.title, description: vid.description || '', url: vid.url, thumbnail: vid.thumbnail || '', duration_seconds: vid.duration_seconds, order_index: vid.order_index }); setShowVideoForm(true); }}
                            className="text-blue-600 hover:text-blue-700 p-2 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if(confirm('حذف هذا الدرس؟')) deleteVideoMutation.mutate({ moduleId: mod.id, videoId: vid.id }); }}
                            className="text-red-500 hover:text-red-600 p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            {course.modules?.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">لم يتم إضافة أي وحدات دراسية بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">{activeModule ? 'تعديل الوحدة' : 'وحدة جديدة'}</h2>
              <button onClick={() => setShowModuleForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">اسم الوحدة</label>
                <input type="text" value={moduleForm.title} onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600" placeholder="مثال: الباب الأول" />
              </div>
              <button onClick={() => moduleMutation.mutate()} disabled={moduleMutation.isPending || !moduleForm.title}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-60 shadow-sm transition-colors">
                {moduleMutation.isPending ? 'جاري الحفظ...' : 'حفظ الوحدة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Form Modal */}
      {showVideoForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">{activeVideo ? 'تعديل الدرس' : 'درس جديد'}</h2>
              <button onClick={() => setShowVideoForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">عنوان الدرس</label>
                <input type="text" value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600" />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">رابط الفيديو (من أي منصة)</label>
                <input type="url" value={videoForm.url} onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))} dir="ltr"
                  className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600 text-left" placeholder="https://..." />
                <p className="text-xs text-gray-400 mt-1">يدعم YouTube, Vimeo, Drive، أو أي رابط مباشر MP4.</p>
              </div>
              
              <ImageUpload
                label="الصورة المصغرة للدرس (اختياري)"
                value={videoForm.thumbnail}
                onChange={(url) => setVideoForm(p => ({ ...p, thumbnail: url }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 font-semibold block mb-2">المدة (ثواني)</label>
                  <input type="number" value={videoForm.duration_seconds} onChange={e => setVideoForm(p => ({ ...p, duration_seconds: Number(e.target.value) }))}
                    className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 font-semibold block mb-2">الترتيب</label>
                  <input type="number" value={videoForm.order_index} onChange={e => setVideoForm(p => ({ ...p, order_index: Number(e.target.value) }))}
                    className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">وصف قصير (اختياري)</label>
                <textarea value={videoForm.description} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full bg-[#f4f7fe] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-600 resize-none" />
              </div>

              <button onClick={() => videoMutation.mutate()} disabled={videoMutation.isPending || !videoForm.title || !videoForm.url}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-60 shadow-sm transition-colors">
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
