const PLATFORM_STYLES = {
  instagram: { bg: '#e1306c', text: '#fff', label: 'Instagram' },
  tiktok:    { bg: '#010101', text: '#fff', label: 'TikTok' },
  facebook:  { bg: '#1877f2', text: '#fff', label: 'Facebook' },
  youtube:   { bg: '#ff0000', text: '#fff', label: 'YouTube' },
  threads:   { bg: '#000000', text: '#fff', label: 'Threads' },
};

export default function PlatformBadge({ platform }) {
  const style = PLATFORM_STYLES[platform?.toLowerCase()] || {
    bg: '#6b7280',
    text: '#fff',
    label: platform || 'Unknown',
  };

  return (
    <span
      style={{ backgroundColor: style.bg, color: style.text }}
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
    >
      {style.label}
    </span>
  );
}
