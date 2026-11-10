const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function initials(name?: string | null): string {
  const parts = (name ?? "Ban tổ chức").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "O";
  return parts.length === 1
    ? parts[0].slice(0, 2).toLocaleUpperCase("vi-VN")
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase("vi-VN");
}

function colorFor(name?: string | null): string {
  const safeName = name ?? "Organizer";
  let hash = 0;
  for (const character of safeName) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function OrganizerAvatar({ name = "Ban tổ chức", avatarUrl }: { name?: string | null; avatarUrl?: string | null }) {
  const safeName = name ?? "Ban tổ chức";
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={safeName}
        className="inline-flex size-10 shrink-0 rounded-full object-cover shadow-sm border border-white/20"
      />
    );
  }
  return (
    <span aria-label={safeName} title={safeName} className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorFor(safeName)}`}>
      {initials(safeName)}
    </span>
  );
}
