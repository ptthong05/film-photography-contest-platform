import type { ContestItem } from '../LiveContestsSection';

export interface TimelineMilestone {
  title: string;
  date: string;
  description?: string;
  completed?: boolean;
}

export interface PrizeItem {
  rank: string;
  name: string;
  reward: string;
  quantity?: string;
  icon?: string;
}

export interface ContestDetailData extends ContestItem {
  organizer?: {
    name: string;
    avatar: string;
    role: string;
  };
  judges?: {
    name: string;
    avatar: string;
    title: string;
  }[];
  timeline?: TimelineMilestone[];
  rules?: string[];
  prizes?: PrizeItem[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  pastPhotos?: {
    id: string;
    image: string;
    title: string;
    author: string;
  }[];
}
