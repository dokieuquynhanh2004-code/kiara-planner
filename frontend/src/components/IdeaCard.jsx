import PlatformBadge from './PlatformBadge';

const MOOD_LABELS = {
  educational:   { label: 'Giáo dục',    bg: '#dbeafe', text: '#1d4ed8' },
  entertaining:  { label: 'Giải trí',    bg: '#fce7f3', text: '#be185d' },
  promotional:   { label: 'Quảng cáo',   bg: '#fef9c3', text: '#a16207' },
  inspirational: { label: 'Truyền cảm',  bg: '#ede9fe', text: '#7c3aed' },
  trending:      { label: 'Trending',     bg: '#dcfce7', text: '#15803d' },
};

export default function IdeaCard({ idea, onFavorite, onClick }) {
  const moodStyle = MOOD_LABELS[idea.mood] || { label: idea.mood, bg: '#f3f4f6', text: '#6b7280' };

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(idea)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">{idea.title}</h3>
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite && onFavorite(idea); }}
          className="text-lg leading-none shrink-0"
        >
          {idea.is_favorite ? '❤️' : '🤍'}
        </button>
      </div>
      {idea.description && (
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{idea.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {idea.mood && (
          <span
            style={{ backgroundColor: moodStyle.bg, color: moodStyle.text }}
            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
          >
            {moodStyle.label}
          </span>
        )}
        {idea.platforms?.map((p) => <PlatformBadge key={p} platform={p} />)}
      </div>
    </div>
  );
}
