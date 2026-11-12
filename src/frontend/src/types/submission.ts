export type SubmissionStatus = "VALID" | "PENDING";

export interface FilmMetadata {
  filmStock: string;
  iso: string;
  camera: string;
  cameraBody?: string;
  lens: string;
  format: string;
  filmFormat?: string;
  rollCode: string;
  frame: string;
  frameNumber?: string;
  location: string;
  shootingLocation?: string;
  lab: string;
  developingLab?: string;
  scan: string;
  scanSpec?: string;
  negative: string;
}

export interface SubmissionAiAnalysis {
  similarityScore: string;
  similarityFlag: boolean;
  isAiGenerated: boolean;
  aiConfidence: string;
  autoKeywords: string[];
  verifiedAt: string;
}

export interface Submission {
  id: string;
  code: string;
  title: string;
  authorName: string;
  contestId?: string;
  contestName: string;
  contestTitle?: string;
  submittedAt: string;
  createdAt?: string;
  status: SubmissionStatus;
  reviewStatus?: "APPROVED" | "REJECTED" | "PENDING";
  metadata: FilmMetadata;
  imageUrl?: string;
  imageUrls?: string[];
  thumbnailUrls?: string[];
  category?: string;
  description?: string;
  aiAnalysis?: SubmissionAiAnalysis;
}
