import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PlatformBadge from '../components/PlatformBadge';
import Modal from '../components/Modal';

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'youtube', 'threads'];
const CONTENT_TYPES = ['image', 'video', 'carousel', 'reel', 'story'];

const MOODS = [
  { value: '',               label: 'Tất cả',             emoji: '' },
  { value: 'educational',    label: 'Giáo dục',           emoji: '📚' },
  { value: 'entertaining',   label: 'Giải trí',           emoji: '🎭' },
  { value: 'promotional',    label: 'Quảng cáo',          emoji: '📢' },
  { value: 'inspirational',  label: 'Truyền cảm hứng',   emoji: '✨' },
  { value: 'trending',       label: 'Trending',           emoji: '🔥' },
];

const PLATFORM_COLORS = {
  instagram: '#e1306c',
  tiktok:    '#010101',
  facebook:  '#1877f2',
  youtube:   '#ff0000',
  threads:   '#000000',
};

const EMPTY_FORM = {
  title: '', description: '', mood: '', platforms: [], content_type: '', tags: '',
};

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMoodStyle(mood) {
  const map = {
    educational:   { bg: '#dbeafe', text: '#1d4ed8', emoji: '📚' },
    entertaining:  { bg: '#fce7f3', text: '#be185d', emoji: '🎭' },
    promotional:   { bg: '#fef9c3', text: '#a16207', emoji: '📢' },
    inspirational: { bg: '#ede9fe', text: '#7c3aed', emoji: '✨' },
    trending:      { bg: '#dcfce7', text: '#15803d', emoji: '🔥' },
  };
  return map[mood] || null;
}

function IdeaCardFull({ idea, onFavorite, onEdit, onDelete, onConvert }) {
  const moodStyle = getMoodStyle(idea.mood);

  return (
    <div
      className={`bg-white rounded-xl border-2 p-4 flex flex-col gap-3 transition-all hover:shadow-md ${
        idea.is_favorite ? 'border-pink-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start gap-2">
        <h3
          className="flex-1 font-semibold text-gray-800 text-sm leading-snug cursor-pointer hover:text-pink-600 transition-colors"
          onClick={() => onEdit(idea)}
        >
          {idea.title}
        </h3>
      </div>

      {idea.description && (
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{idea.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {moodStyle && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: moodStyle.bg, color: moodStyle.text }}
          >
            {moodStyle.emoji} {MOODS.find((m) => m.value === idea.mood)?.label}
          </span>
        )}
        {idea.platforms?.map((p) => <PlatformBadge key={p} platform={p} />)}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400">{formatDate(idea.created_at)}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onFavorite(idea)}
            title={idea.is_favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-pink-50 transition-colors text-base"
          >
            {idea.is_favorite ? '❤️' : '🤍'}
          </button>
          <button
            onClick={() => onConvert(idea)}
            title="Chuyển thành bài đăng"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors text-base"
          >
            📋
          </button>
          <button
            onClick={() => onEdit(idea)}
            title="Sửa"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-base"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(idea.id)}
            title="Xóa"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-base"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function IdeaFormModal({ isOpen, onClose, initialData, onSaved }) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm]   = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setL]   = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          title:        initialData.title || '',
          description:  initialData.description || '',
          mood:         initialData.mood || '',
          platforms:    initialData.platforms || [],
          content_type: initialData.content_type || '',
          tags:         (initialData.tags || []).join(', '),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError('');
    }
  }, [isOpen, initialData]);

  function set(field, val) { setForm((f) => ({ ...f, [field]: val })); }

  function togglePlatform(p) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setL(true);
    const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const payload = { ...form, tags };
    try {
      if (isEdit) {
        await api.put(`/ideas/${initialData.id}`, payload);
      } else {
        await api.post('/ideas', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra!');
    } finally { setL(false); }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa ý tưởng' : 'Thêm ý tưởng mới'}
    >
      {error && (
        <p className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Tên ý tưởng <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Nhập tên ý tưởng…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Mô tả chi tiết ý tưởng…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Loại nội dung</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('content_type', c === form.content_type ? '' : c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                  form.content_type === c
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Tâm trạng nội dung
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.filter((m) => m.value).map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => set('mood', m.value === form.mood ? '' : m.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.mood === m.value
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Chọn platform (nhiều lựa chọn)
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = form.platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all capitalize ${
                    active ? 'text-white' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                  style={active ? { backgroundColor: PLATFORM_COLORS[p], borderColor: PLATFORM_COLORS[p] } : {}}
                >
                  {active && <span className="text-white">✓</span>}
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Tags (phân cách bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="beauty, skincare, tips…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: '#a78bfa' }}
          >
            {loading ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm ý tưởng'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Ideas() {
  const navigate = useNavigate();
  const [ideas, setIdeas]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterMood, setFM]         = useState('');
  const [filterPlatform, setFP]     = useState('');
  const [sortFav, setSortFav]       = useState(false);
  const [keyword, setKeyword]       = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editIdea, setEditIdea]     = useState(null);
  const [convertMsg, setConvertMsg] = useState({ id: null, text: '', ok: true });

  async function loadIdeas() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMood)     params.set('mood', filterMood);
      if (filterPlatform) params.set('platform', filterPlatform);
      if (keyword)        params.set('keyword', keyword);
      const res = await api.get(`/ideas?${params}`);
      let list = res.data.ideas;
      if (sortFav) list = [...list].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
      setIdeas(list);
    } catch (_) {}
    finally { setLoading(false); }
  }

  useEffect(() => { loadIdeas(); }, [filterMood, filterPlatform, keyword, sortFav]);

  async function handleFavorite(idea) {
    try {
      const res = await api.patch(`/ideas/${idea.id}/favorite`);
      setIdeas((prev) => {
        const updated = prev.map((i) => i.id === idea.id ? res.data.idea : i);
        return sortFav ? [...updated].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0)) : updated;
      });
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Xóa ý tưởng này?')) return;
    try { await api.delete(`/ideas/${id}`); loadIdeas(); } catch (_) {}
  }

  async function handleConvert(idea) {
    try {
      await api.post(`/ideas/${idea.id}/convert`);
      setConvertMsg({ id: idea.id, text: `"${idea.title}" đã chuyển thành bài nháp!`, ok: true });
      setTimeout(() => {
        setConvertMsg({ id: null, text: '', ok: true });
        navigate('/calendar');
      }, 1800);
    } catch (err) {
      setConvertMsg({ id: idea.id, text: err.response?.data?.error || 'Có lỗi khi chuyển!', ok: false });
      setTimeout(() => setConvertMsg({ id: null, text: '', ok: true }), 3000);
    }
  }

  function openCreate() { setEditIdea(null); setShowForm(true); }
  function openEdit(idea) { setEditIdea(idea); setShowForm(true); }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Toast chuyển bài */}
      {convertMsg.text && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            convertMsg.ok ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {convertMsg.ok ? '✅' : '❌'} {convertMsg.text}
        </div>
      )}

      {/* Thanh tìm kiếm + nút tạo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm ý tưởng…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <button
          onClick={openCreate}
          className="ml-auto px-4 py-2 rounded-xl text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: '#a78bfa' }}
        >
          + Thêm ý tưởng
        </button>
      </div>

      {/* Bộ lọc mood — tab */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setFM(m.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filterMood === m.value
                ? 'border-purple-400 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
            }`}
          >
            {m.emoji && <span className="mr-1">{m.emoji}</span>}
            {m.label}
          </button>
        ))}
      </div>

      {/* Bộ lọc platform + sắp xếp */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select
          value={filterPlatform}
          onChange={(e) => setFP(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-white"
        >
          <option value="">Tất cả platform</option>
          {PLATFORMS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
        </select>

        <button
          onClick={() => setSortFav((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            sortFav
              ? 'border-pink-400 bg-pink-50 text-pink-700'
              : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
          }`}
        >
          ❤️ {sortFav ? 'Yêu thích trước' : 'Mới nhất'}
        </button>

        <span className="ml-auto text-xs text-gray-400">{ideas.length} ý tưởng</span>
      </div>

      {/* Lưới ý tưởng */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-36" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">💡</p>
          <p className="text-base font-medium text-gray-600">Chưa có ý tưởng nào</p>
          <p className="text-sm mt-1">Bắt đầu ghi lại ý tưởng đầu tiên của bạn!</p>
          <button
            onClick={openCreate}
            className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#a78bfa' }}
          >
            + Thêm ý tưởng
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCardFull
              key={idea.id}
              idea={idea}
              onFavorite={handleFavorite}
              onEdit={openEdit}
              onDelete={handleDelete}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}

      <IdeaFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        initialData={editIdea}
        onSaved={loadIdeas}
      />
    </div>
  );
}
