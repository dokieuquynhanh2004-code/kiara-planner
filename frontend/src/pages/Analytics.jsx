import { useState, useEffect } from 'react';
import api from '../api/axios';

const PLATFORM_COLORS = {
  instagram: '#e1306c',
  tiktok:    '#333333',
  facebook:  '#1877f2',
  youtube:   '#ff0000',
  threads:   '#888888',
};

const STATUS_COLORS  = { idea: '#9ca3af', draft: '#fbbf24', scheduled: '#60a5fa', published: '#34d399' };
const STATUS_LABELS  = { idea: 'Ý tưởng', draft: 'Bản nháp', scheduled: 'Lên lịch', published: 'Đã đăng' };
const STATUS_ORDER   = ['published', 'scheduled', 'draft', 'idea'];

/* ---------- SVG Donut chart ---------- */
const DONUT_R  = 52;
const DONUT_CX = 64;
const DONUT_CY = 64;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;

function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Chưa có dữ liệu
      </div>
    );
  }

  let offset = 0;
  const segments = STATUS_ORDER.map((status) => {
    const count  = data[status] || 0;
    const frac   = count / total;
    const dash   = frac * CIRCUMFERENCE;
    const seg    = { status, count, dash, offset: offset * CIRCUMFERENCE };
    offset += frac;
    return seg;
  }).filter((s) => s.count > 0);

  return (
    <div className="flex items-center gap-6">
      <svg width="128" height="128" className="shrink-0">
        <circle cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R} fill="none" stroke="#f3f4f6" strokeWidth="18" />
        {segments.map((seg) => (
          <circle
            key={seg.status}
            cx={DONUT_CX}
            cy={DONUT_CY}
            r={DONUT_R}
            fill="none"
            stroke={STATUS_COLORS[seg.status]}
            strokeWidth="18"
            strokeDasharray={`${seg.dash} ${CIRCUMFERENCE}`}
            strokeDashoffset={-seg.offset}
            transform={`rotate(-90 ${DONUT_CX} ${DONUT_CY})`}
            strokeLinecap="butt"
          />
        ))}
        <text x={DONUT_CX} y={DONUT_CY - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1f2937">
          {total}
        </text>
        <text x={DONUT_CX} y={DONUT_CY + 12} textAnchor="middle" fontSize="10" fill="#9ca3af">
          tổng cộng
        </text>
      </svg>

      <div className="space-y-2 flex-1">
        {STATUS_ORDER.map((status) => {
          const count = data[status] || 0;
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-xs text-gray-600 flex-1">{STATUS_LABELS[status]}</span>
              <span className="text-xs font-semibold text-gray-700">{count}</span>
              <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- CSS Bar chart ---------- */
function BarChart({ data }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-3 h-40 pt-2">
      {entries.map(([platform, count]) => {
        const heightPct = (count / max) * 100;
        return (
          <div key={platform} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-xs font-bold text-gray-700">{count}</span>
            <div className="w-full rounded-t-lg transition-all duration-500 relative" style={{ height: `${Math.max(heightPct, 4)}%`, backgroundColor: PLATFORM_COLORS[platform] || '#9ca3af' }}>
            </div>
            <span className="text-[10px] text-gray-500 capitalize truncate w-full text-center">{platform}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Heatmap + Streak ---------- */
function calcStreak(heatmapObj, daysInMonth) {
  const today = new Date().getDate();
  let streak = 0;
  for (let d = today; d >= 1; d--) {
    if ((heatmapObj[d] || 0) > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getFirstDayOffset(year, month) {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

/* ---------- Skeleton ---------- */
function Skeleton({ h = 'h-40' }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${h}`} />;
}

/* ---------- Main ---------- */
export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [month, setMonth]     = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [heatLoading, setHL]  = useState(false);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [sumRes, heatRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get(`/analytics/heatmap?month=${month}`),
        ]);
        setSummary(sumRes.data);
        setHeatmap(heatRes.data);
      } catch (_) {}
      finally { setLoading(false); }
    }
    loadAll();
  }, []);

  useEffect(() => {
    if (!summary) return;
    async function loadHeat() {
      setHL(true);
      try {
        const res = await api.get(`/analytics/heatmap?month=${month}`);
        setHeatmap(res.data);
      } catch (_) {}
      finally { setHL(false); }
    }
    loadHeat();
  }, [month]);

  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const firstOffset = getFirstDayOffset(year, mon);
  const streak      = heatmap ? calcStreak(heatmap.heatmap, daysInMonth) : 0;

  const metricCards = summary
    ? [
        { label: 'Tổng bài đăng',    value: summary.posts.total,                    color: '#f472b6', icon: '📝' },
        { label: 'Đã đăng',           value: summary.posts.by_status.published || 0, color: '#34d399', icon: '✅' },
        { label: 'Đang lên lịch',     value: summary.posts.by_status.scheduled || 0, color: '#60a5fa', icon: '📅' },
        { label: 'Kho ý tưởng',       value: summary.ideas.total,                    color: '#a78bfa', icon: '💡' },
      ]
    : null;

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-5xl mx-auto space-y-6">

      {/* 4 metric */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <Skeleton key={i} h="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards?.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3" style={{ borderLeftColor: c.color, borderLeftWidth: 4 }}>
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold leading-tight" style={{ color: c.color }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Biểu đồ cột platform + Donut status */}
      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton h="h-64" />
          <Skeleton h="h-64" />
        </div>
      ) : summary && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Bài đăng theo platform</h3>
            <BarChart data={summary.posts.by_platform} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Tỉ lệ theo trạng thái</h3>
            <DonutChart data={summary.posts.by_status} />
          </div>
        </div>
      )}

      {/* Streak + Heatmap */}
      {loading ? (
        <Skeleton h="h-64" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-800 text-sm">Heatmap hoạt động</h3>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1 rounded-full">
                  <span className="text-base">🔥</span>
                  <span className="text-sm font-bold" style={{ color: '#f472b6' }}>{streak}</span>
                  <span className="text-xs text-gray-500">ngày liên tiếp</span>
                </div>
              )}
            </div>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400"
            />
          </div>

          {heatLoading ? (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="aspect-square rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {['T2','T3','T4','T5','T6','T7','CN'].map((d) => (
                  <div key={d} className="text-center text-xs text-gray-400 font-semibold pb-1">{d}</div>
                ))}
                {Array.from({ length: firstOffset }, (_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day   = i + 1;
                  const count = heatmap?.heatmap[day] || 0;
                  const alpha = count === 0 ? 0.07 : Math.min(0.15 + count * 0.25, 1);
                  const isToday = new Date().getDate() === day &&
                    new Date().toISOString().slice(0, 7) === month;
                  return (
                    <div
                      key={day}
                      title={`Ngày ${day}: ${count} bài`}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        isToday ? 'ring-2 ring-pink-400 ring-offset-1' : ''
                      }`}
                      style={{
                        backgroundColor: `rgba(244,114,182,${alpha})`,
                        color: count > 0 ? '#be185d' : '#d1d5db',
                        fontWeight: count > 0 ? '700' : '400',
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-xs text-gray-400">Ít</span>
                {[0.07, 0.3, 0.55, 0.8, 1].map((a) => (
                  <span key={a} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(244,114,182,${a})` }} />
                ))}
                <span className="text-xs text-gray-400">Nhiều</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tổng ý tưởng */}
      {!loading && summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Ý tưởng</h3>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-bold" style={{ color: '#a78bfa' }}>{summary.ideas.total}</p>
                <p className="text-xs text-gray-400 mt-0.5">tổng cộng</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: '#f472b6' }}>{summary.ideas.favorites}</p>
                <p className="text-xs text-gray-400 mt-0.5">yêu thích</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Tỉ lệ đăng thành công</h3>
            {summary.posts.total > 0 ? (
              <>
                <p className="text-3xl font-bold" style={{ color: '#34d399' }}>
                  {Math.round(((summary.posts.by_status.published || 0) / summary.posts.total) * 100)}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {summary.posts.by_status.published || 0} / {summary.posts.total} bài đã đăng
                </p>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(((summary.posts.by_status.published || 0) / summary.posts.total) * 100)}%`,
                      backgroundColor: '#34d399',
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Chưa có bài đăng nào</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
