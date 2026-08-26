import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings';
import { Settings, Save, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const SETTING_GROUPS = [
  {
    title: 'هوية المنصة',
    fields: [
      { key: 'platform_name', label: 'اسم المنصة', type: 'text' },
      { key: 'platform_logo', label: 'رابط شعار المنصة', type: 'url' },
    ],
  },
  {
    title: 'معلومات المدرس',
    fields: [
      { key: 'instructor_name', label: 'اسم المدرس', type: 'text' },
      { key: 'instructor_image', label: 'رابط صورة المدرس', type: 'url' },
      { key: 'instructor_bio', label: 'نبذة تعريفية', type: 'textarea' },
      { key: 'instructor_email', label: 'البريد الإلكتروني', type: 'email' },
      { key: 'instructor_phone', label: 'رقم الهاتف', type: 'text' },
    ],
  },
  {
    title: 'الألوان',
    fields: [
      { key: 'primary_color', label: 'اللون الأساسي', type: 'color' },
      { key: 'secondary_color', label: 'اللون الثانوي', type: 'color' },
      { key: 'background_color', label: 'لون الخلفية', type: 'color' },
      { key: 'card_color', label: 'لون البطاقات', type: 'color' },
      { key: 'accent_color', label: 'لون التأكيد', type: 'color' },
    ],
  },
  {
    title: 'روابط التواصل الاجتماعي',
    fields: [
      { key: 'facebook_url', label: 'فيسبوك', type: 'url' },
      { key: 'instagram_url', label: 'إنستغرام', type: 'url' },
      { key: 'youtube_url', label: 'يوتيوب', type: 'url' },
      { key: 'telegram_url', label: 'تيليغرام', type: 'url' },
    ],
  },
];

const SettingsPage = () => {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then(r => r.data),
  });

  useEffect(() => {
    if (settings) setValues(settings);
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    // Live update CSS variables for colors
    const cssVarMap: Record<string, string> = {
      primary_color: '--color-primary',
      background_color: '--color-bg',
      card_color: '--color-card',
      accent_color: '--color-accent',
    };
    if (cssVarMap[key]) {
      document.documentElement.style.setProperty(cssVarMap[key], value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateMany(values);
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('تم حفظ الإعدادات');
    } catch {
      toast.error('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-48 bg-card rounded-2xl border border-border" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          إعدادات المنصة
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {SETTING_GROUPS.map(group => (
        <div key={group.title} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-border">{group.title}</h2>
          <div className="space-y-4">
            {group.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-muted mb-2">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={values[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                  />
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={values[field.key] || '#f59e0b'}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className="w-12 h-12 rounded-xl border border-border cursor-pointer bg-transparent p-1"
                    />
                    <input
                      type="text"
                      value={values[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder="#f59e0b"
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono"
                      dir="ltr"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    dir={field.type === 'email' || field.type === 'url' ? 'ltr' : 'rtl'}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsPage;
