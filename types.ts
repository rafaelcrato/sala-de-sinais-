

export type UserRole = 'user' | 'admin';

export type LicenseStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  licenseStatus: LicenseStatus;
  joinedAt: string; // ISO Date
  paidAt?: string; // ISO Date
  avatar?: string;
}

export type SignalDirection = 'BUY' | 'SELL';
export type SignalDuration = '15s' | '30s' | '1m' | '5m' | '15m';
export type SignalStatus = 'active' | 'closed' | 'expired';

export interface Signal {
  id: string;
  symbol: string; // e.g. BTCUSDT
  direction: SignalDirection; // mapped from 'action'
  entryPrice: number;
  stopLoss: number;
  takeProfit: number[]; // Array of targets
  duration: SignalDuration;
  expirySeconds: number;
  expiresAt: number; // Timestamp
  createdAt: number; // Timestamp
  notes?: string;
  status: SignalStatus;
  generatedBy: 'MANUAL' | 'AUTO_BOT';
  result?: 'WIN' | 'LOSS' | 'NEUTRAL';
  logo?: string;
}

export interface BotConfig {
    isActive: boolean;
    intervalSeconds: number;
}