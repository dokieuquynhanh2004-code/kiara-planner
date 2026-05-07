import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',          icon: '⊞', label: 'Tổng quan' },
  { to: '/calendar',  icon: '📅', label: 'Lịch' },
  { to: '/ideas',     icon: '💡', label: 'Ý tưởng' },
  { to: '/analytics', icon: '📊', label: 'Thống kê' },
  { to: '/profile',   icon: '👤', label: 'Hồ sơ' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
      <div className="flex">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-pink-500' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
