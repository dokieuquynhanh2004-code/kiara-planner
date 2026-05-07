import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/':          'Tổng quan',
  '/calendar':  'Lịch đăng',
  '/ideas':     'Kho ý tưởng',
  '/analytics': 'Thống kê',
  '/profile':   'Hồ sơ',
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] || 'Kiara Planner';

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>
      {user?.brand_name && (
        <span className="text-sm text-gray-400 font-medium">{user.brand_name}</span>
      )}
    </header>
  );
}
