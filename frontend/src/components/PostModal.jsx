import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import api from '../api/axios';

const PLATFORM_COLORS = {
  instagram: '#e1306c',
  tiktok:    '#333333',
  facebook:  '#1877f2',
  youtube:   '#ff0000',
  threads:   '#666666',
};

const CONTENT_TYPE_ICONS = {
  image:    '🖼️',
  video:    '🎥',
  carousel: '🎠',
  reel:     '🎬',
  story:    '📱',
};

const STATUS_OPTIONS = [
  { value: 'idea',      label: 'Ý tưởng' },
  { value: 'draft',     label: 'Bản nháp' },
  { value: 'scheduled', label: 'Lên lịch' },
  { value: 'published', label: 'Đã đăng' },
];

const EMPTY_FORM = {
  title:        '',
  caption:      '',
  content_type: 'image',
  platform:     'instagram',
  status:       'draft',
  scheduled_at: '',
  notes:        '',
  hashtags:     [],
};

function toLocalDatetimeValue(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function postToForm(post) {
  return {
    title:        post.title || '',
    caption:      post.caption || '',
    content_type: post.content_type || 'image',
    platform:     post.platform || 'instagram',
    status:       post.status || 'draft',
    scheduled_at: toLocalDatetimeValue(post.scheduled_at),
    notes:        post.notes || '',
    hashtags:     post.hashtags
      ? post.hashtags.split(/\s+/).filter(Boolean).map((t) => t.replace(/^#/, ''))
      : [],
  };
}

export default function PostModal({ isOpen, onClose, post, onSaved }) {
  const isEdit = Boolean(post?.id);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const tagRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm(post?.id ? postToForm(post) : EMPTY_FORM);
      setTagInput('');
      setError('');
    }
  }, [isOpen, post]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addTag() {
    const raw = tagInput.trim().replace(/^#/, '');
    if (!raw) return;
    if (!form.hashtags.includes(raw)) {
      set('hashtags', [...form.hashtags, raw]);
    }
    setTagInput('');
    tagRef.current?.focus();
  }

  function removeTag(tag) {
    set('hashtags', form.hashtags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && tagInput === '' && form.hashtags.length > 0) {
      set('hashtags', form.hashtags.slice(0, -1));
    }
  }

  async function submit(overrideStatus) {
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      status:   overrideStatus || form.status,
      hashtags: form.hashtags.map((t) => `#${t}`).join(' '),
      scheduled_at: form.scheduled_at || null,
    };
    try {
      if (isEdit) {
        await api.put(`/posts/${post.id}`, payload);
      } else {
        await api.post('/posts', payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  }

  const needDatetime = form.status === 'scheduled' || form.status === 'published';
  const canSchedule  = form.scheduled_at && form.status !== 'published';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}
    >
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Tiêu đề */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Tiêu đề bài đăng <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Nhập tiêu đề bài đăng…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {/* Caption */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-600">Caption / Nội dung</label>
            <span className="text-xs text-gray-400">{form.caption.length} ký tự</span>
          </div>
          <textarea
            rows={3}
            value={form.caption}
            onChange={(e) => set('caption', e.target.value)}
            placeholder="Viết caption cho bài đăng…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
          />
        </div>

        {/* Loại nội dung */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Loại nội dung</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CONTENT_TYPE_ICONS).map(([type, icon]) => (
              <button
                key={type}
                type="button"
                onClick={() => set('content_type', type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.content_type === type
                    ? 'border-pink-400 bg-pink-50 text-pink-700 shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span>{icon}</span>
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Platform</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
              <button
                key={platform}
                type="button"
                onClick={() => set('platform', platform)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all capitalize ${
                  form.platform === platform
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
                style={
                  form.platform === platform
                    ? { backgroundColor: color, borderColor: color }
                    : {}
                }
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Trạng thái</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('status', opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.status === opt.value
                    ? 'border-gray-500 bg-gray-700 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ngày giờ — chỉ hiện khi cần */}
        {needDatetime && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày và giờ đăng</label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => set('scheduled_at', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
        )}

        {/* Hashtags pill input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Hashtags</label>
          <div
            className="flex flex-wrap gap-1.5 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 cursor-text min-h-[40px]"
            onClick={() => tagRef.current?.focus()}
          >
            {form.hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 text-xs font-medium px-2 py-0.5 rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                  className="text-pink-400 hover:text-pink-600 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={tagRef}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={form.hashtags.length === 0 ? 'Gõ hashtag rồi nhấn Enter…' : ''}
              className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Gõ tên rồi nhấn Enter để thêm, Backspace để xóa</p>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú thêm</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Ghi chú nội bộ, không hiện trên bài đăng…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
          />
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Hủy
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!form.title.trim() || loading}
            onClick={() => submit('draft')}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Lưu nháp
          </button>
          {canSchedule && (
            <button
              type="button"
              disabled={!form.title.trim() || loading}
              onClick={() => submit('scheduled')}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#f472b6' }}
            >
              {loading ? 'Đang lưu…' : 'Lên lịch'}
            </button>
          )}
          {!canSchedule && (
            <button
              type="button"
              disabled={!form.title.trim() || loading}
              onClick={() => submit()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#f472b6' }}
            >
              {loading ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo bài'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
