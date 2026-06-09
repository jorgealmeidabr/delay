export type Role = 'ADMIN' | 'MODERATOR' | 'AFFILIATE' | 'FREE_USER' | 'PRO_USER';
export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'MANAGE_USERS';
export type Platform = 'Globoplay' | 'SporTV' | 'ESPN' | 'YouTube' | 'Outros';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  referredBy?: string;
}

export interface Calibration {
  id: string;
  userId: string;
  delayMs: number;
  platform: Platform;
  createdAt: string;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  platform: Platform;
}

export interface Affiliate {
  userId: string;
  code: string;
  referralsCount: number;
}
