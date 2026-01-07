export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  prioritas?: string;
}

export interface Entry {
  id: number; // timestamp
  website: string;
  cookies: Cookie[];
  username?: string;
  password?: string;
  createdAt: number; // timestamp ms
}

export interface StorageData {
  entries: Entry[];
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

// Preset Types
export type PresetType = 'simple' | 'full' | 'credentials';

export interface PresetCookie {
  name: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  prioritas?: string;
}

export interface Preset {
  id: number;
  key: string;
  type: PresetType;
  name: string;
  group: string;
  cookies: PresetCookie[];
  createdAt: number;
  updatedAt: number;
}

