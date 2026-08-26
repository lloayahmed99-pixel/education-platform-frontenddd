import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, BookOpen } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.data.token, res.data.user);
      toast.success(`مرحباً ${res.data.user.name}!`);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'moderator') navigate('/moderator/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white">منصة العلم</h1>
          <p className="text-muted mt-2">منصتك التعليمية الاحترافية</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">تسجيل الدخول</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                dir="ltr"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors text-left"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-amber-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted text-center mb-3">بيانات الدخول التجريبية:</p>
            <div className="space-y-2 text-xs">
              {[
                { role: 'مدير', email: 'admin@platform.com', pass: 'Admin@123456', color: 'text-blue-400' },
                { role: 'مشرف', email: 'mod1@platform.com', pass: 'Mod@123456', color: 'text-green-400' },
                { role: 'طالب', email: 'student1@platform.com', pass: 'Student@123456', color: 'text-primary' },
              ].map(({ role, email: e, pass, color }) => (
                <button
                  key={e}
                  onClick={() => { setEmail(e); setPassword(pass); }}
                  className={`w-full text-right bg-background/50 border border-border rounded-lg px-3 py-2 hover:border-primary transition-colors ${color}`}
                >
                  <span className="font-bold">{role}:</span> {e}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-muted text-sm mt-4">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              سجّل الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
