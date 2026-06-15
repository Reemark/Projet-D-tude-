export type ArContent = 'OBJECT_3D' | 'IMAGE' | 'VIDEO' | 'TEXT';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Role = 'PLAYER' | 'PARTNER' | 'ADMIN';

export interface Hunt {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  isPrivate: boolean;
  creatorPseudo: string;
}

export interface Step {
  id: number;
  stepOrder: number;
  latitude: number;
  longitude: number;
  arContent: ArContent;
  arModelUrl?: string;
  clue: string;
  score: number;
}

export interface Progress {
  stepId: number;
  completed: boolean;
}

export interface User {
  email: string;
  pseudo: string;
  role: Role;
}

export interface Participation {
  huntId: number;
  status: 'IN_PROGRESS' | 'FINISHED';
}

export interface LeaderboardEntry {
  pseudo: string;
  totalScore: number;
  rank: number;
}
