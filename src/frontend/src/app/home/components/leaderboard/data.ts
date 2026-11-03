export interface PhotographerRankItem {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  submissionCount: number;
  gold: number;
  silver: number;
  bronze: number;
  totalPoints: number;
  badge?: string;
  year?: string;
  contestId?: string;
}

export interface PhotoRankItem {
  rank: number;
  id: string;
  title: string;
  image: string;
  authorName: string;
  authorAvatar: string;
  contestName: string;
  award: string;
  awardType: 'first' | 'second' | 'third' | 'other';
  likesCount: number;
  judgeScore: number;
  totalPoints: number;
  camera: string;
  filmStock: string;
  year: string;
  contestId: string;
}
