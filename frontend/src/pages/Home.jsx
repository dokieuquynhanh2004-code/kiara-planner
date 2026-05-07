import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PlatformBadge from '../components/PlatformBadge';
import PostModal from '../components/PostModal';
import Modal from '../components/Modal';

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'youtube', 'threads'];
const MOODS_LABELS = {
  educational:   '📚 Giáo dục',
  entertaining:  '🎭 Giải trí',
  promotional:   '📢 Quảng cáo',
  inspirational: '✨ Truyền cảm',
  trending:      '🔥 Trending',
};
const MOODS = Object.keys(MOODS_LABELS);

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function Home() {
  const { user } = useAuth();
  const [summary, setSummary]         = useState(null);
  const [upcomingPosts, setUpcoming]  = useState([]);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showPostModal, setShowPost]  = useState(false);
  const [showIdeaModal, setShowIdea]  = useState(false);
  const [ideaForm, setIdeaForm]       = useState({ title: '', description: '', mood: '', platforms: [] });
  const [ideaError, setIdeaError]     = useState('');
  const [ideaLoading, setIdeaLoad]    = useState(false);

  async function loadData() {
    setLoadingData(true);
    try {
      const [sumRes, postsRes, ideasRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/posts?status=scheduled'),
        api.get('/ideas'),
      ]);
      setSummary(sumRes.data);

      const now = Date.now();
      const in7 = now + 7 * 864e5;
      setUpcoming(
        postsRes.data.posts
          .filter((p) => p.scheduled_at && Date.parse(p.scheduled_at) >= now && Date.parse(p.scheduled_at) <= in7)
          .slice(0, 6)
      );
      setRecentIdeas(ideasRes.data.ideas.slice(0, 5));
    } catch (_) {}
    finally { setLoadingData(false); }
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreateIdea(e) {
    e.preventDefault();
    setIdeaError('');
    setIdeaLoad(true);
    try {
      await api.post('/ideas', ideaForm);
      setShowIdea(false);
      setIdeaForm({ title: '', description: '', mood: '', platforms: [] });
      loadData();
    } catch (err) {
      setIdeaError(err.response?.data?.error || 'Có lỗi xảy ra!');
    } finally { setIdeaLoad(false); }
  }

  function togglePlatform(p) {
    setIdeaForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  }

  const statCards = summary
    ? [
        { label: 'Tổng bài đăng',    value: summary.posts.total,                    color: '#f472b6' },
        { label: 'Đang lên lịch',     value: summary.posts.by_status.scheduled || 0, color: '#60a5fa' },
        { label: 'Đã đăng',           value: summary.posts.by_status.published || 0, color: '#34d399' },
        { label: 'Ý tưởng đã lưu',    value: summary.ideas.total,                    color: '#a78bfa' },
      ]
    : null;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Lời chào */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Xin chào, {user?.name}! 👋</h2>
        {user?.brand_name && (
          <p className="text-gray-500 text-sm mt-0.5">Thương hiệu: {user.brand_name}</p>
        )}
      </div>

      {/* 4 ô thống kê */}
      {loadingData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="h-3 bg-gray-100 rounded mb-3 w-3/4" />
              <div className="h-7 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards?.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 p-4"
              style={{ borderLeftColor: card.color, borderLeftWidth: 4 }}
            >
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sắp đăng + Ý tưởng */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Sắp đăng (7 ngày tới)</h3>
          {upcomingPosts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">Chưa có bài lên lịch trong 7 ngày tới</p>
              <button
                onClick={() => setShowPost(true)}
                className="mt-3 text-sm font-semibold"
                style={{ color: '#f472b6' }}
              >
                + Tạo bài mới
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 shrink-0 w-24">{formatDate(post.scheduled_at)}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{post.title}</span>
                  <PlatformBadge platform={post.platform} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Ý tưởng mới nhất</h3>
          {recentIdeas.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">Chưa có ý tưởng nào được lưu</p>
              <button
                onClick={() => { setShowIdea(true); setIdeaError(''); }}
                className="mt-3 text-sm font-semibold"
                style={{ color: '#a78bfa' }}
              >
                + Thêm ý tưởng
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentIdeas.map((idea) => (
                <li key={idea.id} className="flex items-center gap-3">
                  <span className="text-base">{idea.is_favorite ? '❤️' : '💡'}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{idea.title}</span>
                  {idea.mood && (
                    <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full shrink-0">
                      {MOODS_LABELS[idea.mood] || idea.mood}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Nút tạo */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowPost(true)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#f472b6' }}
        >
          + Tạo bài mới
        </button>
        <button
          onClick={() => { setShowIdea(true); setIdeaError(''); }}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#a78bfa' }}
        >
          + Thêm ý tưởng
        </button>
      </div>

      {/* PostModal — dùng component chung */}
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPost(false)}
        onSaved={loadData}
      />

      {/* Modal ý tưởng nhanh */}
      <Modal isOpen={showIdeaModal} onClose={() => setShowIdea(false)} title="Thêm ý tưởng nhanh">
        {ideaError && (
          <p className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded-lg">{ideaError}</p>
        )}
        <form onSubmit={handleCreateIdea} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tên ý tưởng <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={ideaForm.title}
              onChange={(e) => setIdeaForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Nhập tên ý tưởng…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả ngắn</label>
            <textarea
              rows={2}
              value={ideaForm.description}
              onChange={(e) => setIdeaForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ghi nhanh ý tưởng…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Tâm trạng nội dung</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setIdeaForm((f) => ({ ...f, mood: f.mood === m ? '' : m }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    ideaForm.mood === m
                      ? 'border-purple-400 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {MOODS_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
                    ideaForm.platforms.includes(p)
                      ? 'border-purple-400 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowIdea(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Hủy
            </button>
            <button
              type="submit"
              disabled={ideaLoading}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: '#a78bfa' }}
            >
              {ideaLoading ? 'Đang lưu…' : 'Thêm ý tưởng'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
