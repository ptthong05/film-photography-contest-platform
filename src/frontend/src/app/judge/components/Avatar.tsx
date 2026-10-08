interface AvatarProps {
  name: string;
  imageUrl: string;
  sizeClass?: string;
  textClass?: string;
}

/** "Trần Thị Bình" → "TB": chữ cái đầu của họ và tên, giống cách Gmail/Slack hiển thị. */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

export function Avatar({ name, imageUrl, sizeClass = 'h-10 w-10', textClass = 'text-sm' }: AvatarProps) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className={`${sizeClass} shrink-0 rounded-full object-cover`} />;
  }

  return (
    <span
      className={`${sizeClass} ${textClass} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-semibold text-white`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
