import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings';
import { Facebook, Youtube, MessageCircle, Instagram, BookOpen } from 'lucide-react';

const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const platformName = settings?.platform_name || 'منصة العلم';
  const instructorName = settings?.instructor_name || '';

  const pages = [
    { label: 'الرئيسية', path: '/student/dashboard' },
    { label: 'الكورسات', path: '/student/courses' },
    { label: 'المنتدى', path: '/student/forum' },
    { label: 'المحفوظات', path: '/student/saved' },
  ];

  const socials = [
    { icon: Facebook, label: 'فيسبوك', url: settings?.facebook_url },
    { icon: Instagram, label: 'إنستغرام', url: settings?.instagram_url },
    { icon: Youtube, label: 'يوتيوب', url: settings?.youtube_url },
    { icon: MessageCircle, label: 'تيليغرام', url: settings?.telegram_url },
  ].filter(s => s.url);

  const support = [
    { label: 'التواصل مع دعم الأونلاين', url: settings?.facebook_url },
    { label: 'التواصل مع دعم السنتر', url: settings?.telegram_url },
    ...(instructorName ? [{ label: `المادة العلمية - ${instructorName}`, url: '#' }] : []),
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pages */}
          <div>
            <h3 className="font-bold text-white mb-4">الصفحات</h3>
            <ul className="space-y-2">
              {pages.map(p => (
                <li key={p.label}>
                  <a href={p.path} className="text-muted hover:text-primary transition-colors text-sm">
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-white mb-4">السوشيال ميديا</h3>
            <ul className="space-y-2">
              {socials.length > 0 ? socials.map(s => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm">
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </a>
                </li>
              )) : (
                <li className="text-muted text-sm">لا توجد روابط</li>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-4">تواصل الدعم العلمي</h3>
            <ul className="space-y-2">
              {support.map(s => (
                <li key={s.label}>
                  <a href={s.url || '#'} target="_blank" rel="noreferrer"
                    className="text-muted hover:text-primary transition-colors text-sm">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-white">{platformName}</span>
          </div>
          <p className="text-muted text-sm">
            جميع الحقوق محفوظة © {new Date().getFullYear()} {platformName}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
