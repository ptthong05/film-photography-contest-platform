interface AvatarProps {
  name: string;
}

export function Avatar({ name }: AvatarProps) {
  const initial = name.trim().split(" ").pop()?.charAt(0).toUpperCase() ?? "?";
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">
      {initial}
    </span>
  );
}
