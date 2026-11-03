export interface AuthorAward {
  id: string;
  title: string;
  contestId: string;
  contestName: string;
  year: string;
  rank: string;
  rankIcon: string;
  photoTitle: string;
  photoImage: string;
  prizeReward: string;
}

export interface AuthorContest {
  id: string;
  title: string;
  year: string;
  status: 'Đã hoàn thành' | 'Đang diễn ra' | 'Đạt giải';
  role: string;
  awardReceived?: string;
  entryCount: number;
}

export interface AuthorWork {
  id: string;
  title: string;
  image: string;
  contestName: string;
  award?: string;
  camera: string;
  filmStock: string;
  likes: number;
}

export interface AuthorProfile {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  headline: string;
  bio: string;
  location: string;
  joinedYear: string;
  favoriteGear: string[];
  favoriteFilms: string[];
  awardsCount: number;
  contestsCount: number;
  photosCount: number;
  totalLikes: number;
  awards: AuthorAward[];
  contests: AuthorContest[];
  works: AuthorWork[];
}
