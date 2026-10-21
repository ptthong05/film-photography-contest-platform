import { useState } from "react";
import { CoverArt } from "../../../components/CoverArt";
import streetLifeImage from "../assets/street-life.webp";
import { FEATURED_CONTESTS } from "../../home/components/LiveContestsSection";

interface ContestCoverProps {
  title: string;
  seed: number;
  className?: string;
}

const IMAGE_ALIASES: Record<string, string> = {
  "nature on film": "analog-moments-2025",
};

export function ContestCover({ title, seed, className = "" }: ContestCoverProps) {
  const normalized = title.trim().toLocaleLowerCase("vi-VN");
  const key = IMAGE_ALIASES[normalized] ?? normalized;
  const customImage = normalized === "street life" ? streetLifeImage : undefined;
  const matchedImage = FEATURED_CONTESTS.find((contest) =>
    contest.id === key || contest.title.toLocaleLowerCase("vi-VN") === key,
  )?.image;
  const fallbackImage = FEATURED_CONTESTS[Math.abs(seed) % FEATURED_CONTESTS.length]?.image;
  const image = customImage ?? matchedImage ?? fallbackImage;
  const [failedImage, setFailedImage] = useState<string | null>(null);

  if (!image || failedImage === image) return <CoverArt seed={seed} className={className} />;
  return <img src={image} alt={title} loading="lazy" onError={() => setFailedImage(image)} className={`object-cover ${className}`} />;
}
