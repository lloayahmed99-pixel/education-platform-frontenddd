import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const IMGBB_API_KEY = '60163db4ddfa6bc3a2d2f2d93e506ab1'; // Public/Free key for testing

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = 'اختر صورة' }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صحيح');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        onChange(data.data.url);
        toast.success('تم رفع الصورة بنجاح');
      } else {
        throw new Error(data.error?.message || 'فشل في رفع الصورة');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted font-semibold block">{label}</label>
      
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-border bg-background/50 flex flex-col items-center justify-center overflow-hidden group">
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-muted mb-2" />
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-background border border-border hover:border-primary text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 h-32"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الرفع...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <span className="block font-semibold">اضغط لاختيار صورة</span>
                  <span className="block text-xs text-muted mt-1">JPG, PNG, GIF (الحد الأقصى 5MB)</span>
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
