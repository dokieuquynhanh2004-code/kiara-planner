import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostModal from '../components/PostModal';
import PlatformBadge from '../components/PlatformBadge';
import StatusBadge from '../components/StatusBadge';

const PLATFORM_DOT_COLORS = {
  instagram: '#e1306c',
  tiktok:    '#333333',
  facebook:  '#1877f2',
  youtube:   '#ff0000',
  threads:   '#666666',
};

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function formatMonthLabel(year, month) {
  return `Tháng ${month}/${year}`;
}

function getFirstDayOffset(year, month) {
  const d = new Date(year, month - 1, 1).getDay();
  return (d === 0 ? 6 : d - 1);
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(posts) {
  const map = {};
  posts.forEach((post) => {
    if (!post.scheduled_at) return;
    const day = new Date(post.scheduled_at).getDate();
    if (!map[day]) map[day] = [];
    map[day].push(post);
  });
  return map;
}

function parseYearMonth(str) {
  const [y, m] = str.split('-').map(Number);
  return { year: y, month: m };
}

function addMonth(str, delta) {
  let { year, month } = parseYearMonth(str);
  month += delta;
  if (month > 12) { month = 1; year++; }
  if (month < 1)  { month = 12; year--; }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function Calendar() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [monthStr, setMonthStr]     = useState(new Date().toISOString().slice(0, 7));
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editPost, setEditPost]     = useState(null);
  const [initDate, setInitDate]     = useState('');

  const { year, month } = parseYearMonth(monthStr);
  const daysInMonth  = getDaysInMonth(year, month);
  const firstOffset  = getFirstDayOffset(year, month);
  const postsByDay   = groupByDay(posts);

  async function loadPosts(ms) {
    setLoading(true);
    try {
      const res = await api.get(`/posts?month=${ms}`);
      setPosts(res.data.posts);
    } catch (_) {}
    finally { setLoading(false); }
  }

  useEffect(() => { loadPosts(monthStr); }, [monthStr]);

  function prevMonth() { setMonthStr((s) => addMonth(s, -1)); setSelectedDay(null); }
  function nextMonth() { setMonthStr((s) => addMonth(s, +1)); setSelectedDay(null); }

  function openCreateOnDay(day) {
    const pad = (n) => String(n).padStart(2, '0');
    setInitDate(`${year}-${pad(month)}-${pad(day)}T09:00`);
    setShowCreate(true);
  }

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] || []) : [];

  function DayCell({ day }) {
    const cellPosts = postsByDay[day] || [];
    const dayStr    = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday   = dayStr === todayStr;
    const isSelected = selectedDay === day;
    const visible   = cellPosts.slice(0, 3);
    const extra     = cellPosts.length - 3;

    return (
      <div
        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
        className={`relative min-h-[72px] p-1.5 rounded-xl cursor-pointer transition-all border-2 select-none ${
          isSelected
            ? 'border-pink-400 bg-pink-50'
            : isToday
            ? 'border-pink-200 bg-white'
            : 'border-transparent bg-white hover:border-gray-200'
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
            isToday ? 'bg-pink-500 text-white' : 'text-gray-700'
          }`}
        >
          {day}
        </span>

        <div className="flex flex-wrap gap-1 mt-1">
          {visible.map((post) => (
            <span
              key={post.id}
              title={post.title}
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: PLATFORM_DOT_COLORS[post.platform] || '#9ca3af' }}
            />
          ))}
          {extra > 0 && (
            <span className="text-[9px] text-gray-400 font-medium leading-tight">+{extra}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 pb-16 lg:pb-0">
      {/* Lưới lịch */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {/* Thanh điều hướng tháng */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm"
            >
              ‹
            </button>
            <h2 className="text-base font-bold text-gray-800 w-36 text-center">
              {formatMonthLabel(year, month)}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm"
            >
              ›
            </button>
          </div>
          <button
            onClick={() => { setInitDate(''); setShowCreate(true); }}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#f472b6' }}
          >
            + Tạo bài mới
          </button>
        </div>

        {/* Header ngày tuần */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Lưới ngày */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstOffset }, (_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => (
              <DayCell key={i + 1} day={i + 1} />
            ))}
          </div>
        )}

        {/* Chú thích màu */}
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(PLATFORM_DOT_COLORS).map(([platform, color]) => (
            <div key={platform} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-500 capitalize">{platform}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel bên phải */}
      <div
        className={`border-l border-gray-100 bg-white transition-all duration-200 overflow-y-auto ${
          selectedDay ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'
        }`}
      >
        {selectedDay && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">
                Bài đăng ngày {selectedDay}/{month}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {selectedPosts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">Chưa có bài đăng ngày này</p>
                <button
                  onClick={() => openCreateOnDay(selectedDay)}
                  className="mt-3 text-sm font-semibold"
                  style={{ color: '#f472b6' }}
                >
                  + Tạo bài cho ngày này
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                  >
                    <p className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <PlatformBadge platform={post.platform} />
                      <StatusBadge status={post.status} />
                      {post.scheduled_at && (
                        <span className="text-xs text-gray-400">{formatTime(post.scheduled_at)}</span>
                      )}
                    </div>
                    {post.caption && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.caption}</p>
                    )}
                    <button
                      onClick={() => setEditPost(post)}
                      className="text-xs font-semibold transition-colors"
                      style={{ color: '#f472b6' }}
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => openCreateOnDay(selectedDay)}
                  className="w-full py-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-colors"
                >
                  + Thêm bài cho ngày này
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal tạo bài mới */}
      <PostModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        post={initDate ? { scheduled_at: initDate, status: 'scheduled' } : undefined}
        onSaved={() => loadPosts(monthStr)}
      />

      {/* Modal sửa bài */}
      <PostModal
        isOpen={!!editPost}
        onClose={() => setEditPost(null)}
        post={editPost}
        onSaved={() => { loadPosts(monthStr); setEditPost(null); }}
      />
    </div>
  );
}
