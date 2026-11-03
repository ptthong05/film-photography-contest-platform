import { useState } from "react";
import { CoverArt } from "../../../components/CoverArt";
import streetLifeImage from "../assets/street-life.webp";

interface ContestCoverProps {
  title: string;
  seed: number;
  className?: string;
  /** Ảnh thật của cuộc thi / bài dự thi; thiếu thì dùng ảnh minh họa */
  imageUrl?: string;
}

export function ContestCover({ title, seed, className = "", imageUrl }: ContestCoverProps) {
  const normalized = title.trim().toLocaleLowerCase("vi-VN");
  const customImage = normalized === "street life" ? streetLifeImage : undefined;
  const image = imageUrl || customImage;
  const [failedImage, setFailedImage] = useState<string | null>(null);

  if (!image || failedImage === image) return <CoverArt seed={seed} className={className} />;
  return <img src={image} alt={title} loading="lazy" onError={() => setFailedImage(image)} className={`object-cover ${className}`} />;
}
