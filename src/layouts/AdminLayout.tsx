import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, BookOpen, Video, Award,
  GraduationCap, BarChart2, Bell, Settings, LogOut, Menu, X, BookOpenCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { label: 'لوحة التحكم', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'الطلاب', path: '/admin/students', icon: Users },
    { label: 'المشرفون', path: '/admin/moderators', icon: Shield },
    { label: 'الكورسات', path: '/admin/courses', icon: BookOpen },
    { label: 'الإحصائيات', path: '/admin/statistics', icon: BarChart2 },
    { label: 'الإشعارات', path: '/admin/notifications', icon: Bell },
    { label: 'إعدادات المنصة', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fe]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6" />
            لوحة الإدارة
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-800 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-xl transition-colors text-sm ${isActive ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`
              }
            >
              <item.icon className="w-4 h-4 ml-3 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm mt-2"
          >
            <LogOut className="w-4 h-4 ml-3" />
            تسجيل الخروج
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900 lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-600 text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">مدير النظام</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
