export type SubmissionStatus = "VALID" | "PENDING";

export interface FilmMetadata {
  filmStock: string;
  iso: string;
  camera: string;
  lens: string;
  format: string;
  rollCode: string;
  frame: string;
  location: string;
  lab: string;
  scan: string;
  negative: string;
}

export interface Submission {
  id: string;
  code: string;
  title: string;
  authorName: string;
  contestName: string;
  submittedAt: string;
  status: SubmissionStatus;
  metadata: FilmMetadata;
}
