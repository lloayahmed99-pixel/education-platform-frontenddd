import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, BookOpen, MessageSquare, Bookmark, User, LogOut, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Footer from '../components/layout/Footer';

const StudentLayout = () => {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'الرئيسية', path: '/student/dashboard', icon: Home },
    { name: 'الكورسات', path: '/student/courses', icon: BookOpen },
    { name: 'المنتدى', path: '/student/forum', icon: MessageSquare },
    { name: 'المحفوظات', path: '/student/saved', icon: Bookmark },
    { name: 'حسابي', path: '/student/profile', icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fe]">
      {/* Sidebar - Right side (RTL) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600">منصة العلم</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`
              }
            >
              <item.icon className="w-5 h-5 ml-3" />
              <span className="font-semibold">{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 ml-3" />
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="flex items-center text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              <span>{user?.points || 0} نقطة</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-reverse space-x-2 border-r border-gray-200 pr-4">
              <img src={user?.avatar || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full border border-indigo-400" />
              <span className="text-gray-800 font-semibold text-sm hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-[calc(100vh-130px)]">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default StudentLayout;
