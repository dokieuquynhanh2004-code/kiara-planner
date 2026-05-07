const STATUS_STYLES = {
  idea:      { bg: '#f3f4f6', text: '#6b7280', label: 'Ý tưởng' },
  draft:     { bg: '#fef9c3', text: '#a16207', label: 'Bản nháp' },
  scheduled: { bg: '#dbeafe', text: '#1d4ed8', label: 'Đã lên lịch' },
  published: { bg: '#dcfce7', text: '#15803d', label: 'Đã đăng' },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || {
    bg: '#f3f4f6',
    text: '#6b7280',
    label: status || 'Không rõ',
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
