import { Cookie } from '@/app/types';

export type PresetType = 'simple' | 'full' | 'credentials';

export interface SimplePreset {
  type: 'simple';
  name: string;
  group?: string;
  cookies: string[]; // cookie names only
}

export interface FullPreset {
  type: 'full';
  name: string;
  group?: string;
  cookies: Array<{
    name: string;
    domain?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    prioritas?: string;
  }>;
}

export interface CredentialsPreset {
  type: 'credentials';
  name: string;
  group?: string;
  username?: string;
  password?: string;
  cookies?: string[]; // optional cookie names
}

export type Preset = SimplePreset | FullPreset | CredentialsPreset;

export const PRESETS: Record<string, Preset> = {
  netflix: {
    type: 'simple',
    name: 'Netflix',
    group: 'streaming',
    cookies: ['SecureNetflixId', 'NetflixId'],
  },

  hbogo: {
    type: 'credentials',
    name: 'HBO Go',
    group: 'streaming',
    username: '',
    password: '',
  },

  bstation: {
    type: 'full',
    name: 'BStation',
    group: 'streaming',
    cookies: [
      {
        name: 'SESSDATA',
        domain: '',
        httpOnly: true,
        secure: true,
        sameSite: undefined,
        prioritas: 'Medium',
      },
    ],
  },
  disneyplus: {
    type: 'full',
    name: 'Disney+',
    group: 'streaming',
    cookies: [
      {
        name: 'userUP',
        domain: '.www.apps.disneyplus.com',
        httpOnly: false,
        secure: true,
        sameSite: 'None',
        prioritas: 'Medium',
      },
    ],
  },

  chatgpt : {
    type: 'full',
    name: 'ChatGPT',
    group: 'ai',
    cookies: [
      {
        name: '__Secure-next-auth.session-token',
        domain: '',
        httpOnly: true,
        secure: true,
        sameSite: undefined,
        prioritas: 'Medium',
      },
      {
        name: '__Host-next-auth.csrf-token',
        domain: '',
        httpOnly: true,
        secure: true,
        sameSite: undefined,
        prioritas: 'Medium',
      },
    ],
  },

  perplexity : {
    type: 'full',
    name: 'Perplexity',
    group: 'ai',
    cookies: [
      {
        name: '__Secure-next-auth.session-token',
        domain: '.www.perplexity.ai',
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        prioritas: 'Medium',
      },
    ],
  },
};

export function getPreset(type: string): Preset | null {
  return PRESETS[type] || null;
}

export function getPresetsByGroup(): Record<string, Array<{ key: string; preset: Preset }>> {
  const grouped: Record<string, Array<{ key: string; preset: Preset }>> = {};
  
  Object.entries(PRESETS).forEach(([key, preset]) => {
    const group = preset.group || 'other';
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push({ key, preset });
  });
  
  return grouped;
}

