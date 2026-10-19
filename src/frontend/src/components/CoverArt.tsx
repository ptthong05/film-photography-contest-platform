import { useId } from "react";

// [trời trên, trời dưới, núi] — chưa có ảnh thật nên vẽ ảnh bìa bằng SVG.
const PALETTES = [
  ["#1d4ed8", "#fbbf24", "#0b1d4a"],
  ["#7c3aed", "#fb923c", "#2b1055"],
  ["#0e7490", "#fde68a", "#083344"],
  ["#be123c", "#fdba74", "#4c0519"],
  ["#334155", "#e2e8f0", "#0f172a"],
];

interface CoverArtProps {
  seed: number;
  className?: string;
}

export function CoverArt({ seed, className = "" }: CoverArtProps) {
  const gradientId = useId();
  const [skyTop, skyBottom, mountain] = PALETTES[seed % PALETTES.length];

  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width="160" height="100" fill={`url(#${gradientId})`} />
      <circle cx="112" cy="50" r="11" fill="#fff7d6" opacity="0.9" />
      <path d="M0 100V62l30-26 26 22 24-30 36 38 20-14 24 18v30z" fill={mountain} opacity="0.8" />
      <path d="M0 100V78l36-18 30 14 34-20 60 28v18z" fill={mountain} />
    </svg>
  );
}