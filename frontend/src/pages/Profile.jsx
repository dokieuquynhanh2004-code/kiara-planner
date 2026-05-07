import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Profile() {
  const { user, login, logout } = useAuth();
  const { showToast }           = useToast();

  const [stats, setStats] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name:       user?.name       || '',
    brand_name: user?.brand_name || '',
    industry:   user?.industry   || '',
  });
  const [profileLoading, setProfileLoad] = useState(false);

  const [pwForm, setPwForm]   = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoad] = useState(false);
  const [pwError, setPwError]  = useState('');

  useEffect(() => {
    api.get('/analytics/summary').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileLoad(true);
    try {
      const res = await api.put('/auth/profile', profileForm);
      login(localStorage.getItem('token'), res.data.user);
      showToast('Đã cập nhật hồ sơ thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Cập nhật thất bại!', 'error');
    } finally { setProfileLoad(false); }
  }

  async function handlePwSave(e) {
    e.preventDefault();
    setPwError('');
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('Mật khẩu xác nhận không khớp!');
      return;
    }
    setPwLoad(true);
    try {
      await api.put('/auth/password', {
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      showToast('Đã đổi mật khẩu thành công!', 'success');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Đổi mật khẩu thất bại!');
    } finally { setPwLoad(false); }
  }

  function setP(field, val) { setProfileForm((f) => ({ ...f, [field]: val })); }
  function setPw(field, val) { setPwForm((f) => ({ ...f, [field]: val })); }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-2xl mx-auto space-y-5">

      {/* Avatar + tên + thống kê */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #f472b6, #a78bfa)' }}
          >
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-lg truncate">{user?.name}</p>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            {user?.brand_name && (
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">
                {user.brand_name}
              </span>
            )}
          </div>
        </div>

        {/* Thống kê nhanh */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { label: 'Bài đăng', value: stats.posts.total,   color: '#f472b6' },
              { label: 'Đã đăng',  value: stats.posts.by_status.published || 0, color: '#34d399' },
              { label: 'Ý tưởng', value: stats.ideas.total,   color: '#a78bfa' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form chỉnh sửa hồ sơ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Chỉnh sửa hồ sơ</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setP('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên thương hiệu</label>
            <input
              type="text"
              value={profileForm.brand_name}
              onChange={(e) => setP('brand_name', e.target.value)}
              placeholder="VD: Kiara Studio"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngành nghề</label>
            <select
              value={profileForm.industry}
              onChange={(e) => setP('industry', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-white"
            >
              <option value="">— Chọn ngành nghề —</option>
              <option value="Fashion & Lifestyle">👗 Thời trang & Lifestyle</option>
              <option value="Food & Beverage">🍜 Ẩm thực & Đồ uống</option>
              <option value="Beauty & Skincare">💄 Làm đẹp & Skincare</option>
              <option value="Fitness & Health">💪 Fitness & Sức khỏe</option>
              <option value="Travel & Tourism">✈️ Du lịch</option>
              <option value="Education">📚 Giáo dục</option>
              <option value="Technology">💻 Công nghệ</option>
              <option value="Business">💼 Kinh doanh</option>
              <option value="Entertainment">🎭 Giải trí</option>
              <option value="Khác">🌟 Khác</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#f472b6' }}
          >
            {profileLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu…
              </span>
            ) : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Form đổi mật khẩu */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Đổi mật khẩu</h2>
        {pwError && (
          <p className="mb-3 text-red-600 text-sm bg-red-50 p-3 rounded-xl">{pwError}</p>
        )}
        <form onSubmit={handlePwSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              value={pwForm.current_password}
              onChange={(e) => setPw('current_password', e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              required
              value={pwForm.new_password}
              onChange={(e) => setPw('new_password', e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              value={pwForm.confirm_password}
              onChange={(e) => setPw('confirm_password', e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                pwForm.confirm_password && pwForm.confirm_password !== pwForm.new_password
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
              }`}
            />
            {pwForm.confirm_password && pwForm.confirm_password !== pwForm.new_password && (
              <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
            )}
          </div>
          <button
            type="submit"
            disabled={pwLoading || (pwForm.confirm_password && pwForm.confirm_password !== pwForm.new_password)}
            className="w-full py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {pwLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Đang đổi…
              </span>
            ) : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>

      {/* Đăng xuất */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Tài khoản</h2>
        <p className="text-xs text-gray-400 mb-4">Đăng xuất khỏi tất cả thiết bị</p>
        <button
          onClick={logout}
          className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
