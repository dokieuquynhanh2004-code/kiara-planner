import PlatformBadge from './PlatformBadge';
import StatusBadge from './StatusBadge';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PostCard({ post, onClick }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(post)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{post.title}</h3>
        <StatusBadge status={post.status} />
      </div>
      {post.caption && (
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{post.caption}</p>
      )}
      <div className="flex items-center justify-between mt-auto">
        <PlatformBadge platform={post.platform} />
        <span className="text-xs text-gray-400">{formatDate(post.scheduled_at)}</span>
      </div>
    </div>
  );
}
