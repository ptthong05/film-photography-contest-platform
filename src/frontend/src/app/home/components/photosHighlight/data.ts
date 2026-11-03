export interface PhotoDetailItem {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  image: string;
  award?: string;
  contestId?: string;
  contestName?: string;
  category?: string;
  filmStock: string;
  camera: string;
  lens: string;
  shutterSpeed: string;
  aperture: string;
  iso: string;
  lab: string;
  location: string;
  dateTaken: string;
  story: string;
  views: number;
  likes: number;
  year?: string;
}
