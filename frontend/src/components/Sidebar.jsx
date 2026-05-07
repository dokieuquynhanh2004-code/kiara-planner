import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/',          icon: '⊞', label: 'Tổng quan' },
  { to: '/calendar',  icon: '📅', label: 'Lịch đăng' },
  { to: '/ideas',     icon: '💡', label: 'Kho ý tưởng' },
  { to: '/analytics', icon: '📊', label: 'Thống kê' },
  { to: '/profile',   icon: '👤', label: 'Hồ sơ' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-gray-100 min-h-screen">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold" style={{ color: '#f472b6' }}>
          Kiara Planner
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  );
}
