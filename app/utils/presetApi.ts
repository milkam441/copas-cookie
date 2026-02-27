import { Preset, PresetCookie, Cookie } from '@/app/types';

async function safeReadJson<T>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text();

    if (!raw) return null;

    if (contentType.includes('application/json')) {
      return JSON.parse(raw) as T;
    }

    // Fallback for APIs that return JSON without proper content-type header.
    if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      return JSON.parse(raw) as T;
    }

    return null;
  } catch {
    return null;
  }
}

// Fetch all presets from API
export async function fetchPresets(): Promise<Preset[]> {
  try {
    const res = await fetch('/api/presets', { cache: 'no-store' });
    if (!res.ok) {
      let errorMessage = `Failed to fetch presets (${res.status})`;
      const error = await safeReadJson<{ error?: string }>(res);
      if (error?.error) {
        errorMessage = error.error;
      }
      console.warn(errorMessage);
      return [];
    }

    const data = await safeReadJson<Preset[]>(res);
    return data || [];
  } catch (error) {
    console.warn('Failed to fetch presets. Returning empty list.', error);
    return [];
  }
}

// Create a new preset
export async function createPreset(preset: {
  key: string;
  type: 'simple' | 'full' | 'credentials';
  name: string;
  group: string;
  cookies: PresetCookie[];
}): Promise<Preset> {
  const res = await fetch('/api/presets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preset),
  });
  const data = await safeReadJson<Preset | { error?: string }>(res);

  if (!res.ok) {
    throw new Error(
      (data && typeof data === 'object' && 'error' in data && data.error) ||
        'Failed to create preset'
    );
  }

  if (!data || !('id' in data)) {
    throw new Error('Invalid preset response');
  }

  return data;
}

// Update an existing preset
export async function updatePreset(
  id: number,
  preset: {
    key: string;
    type: 'simple' | 'full' | 'credentials';
    name: string;
    group: string;
    cookies: PresetCookie[];
  }
): Promise<Preset> {
  const res = await fetch(`/api/presets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preset),
  });
  const data = await safeReadJson<Preset | { error?: string }>(res);

  if (!res.ok) {
    throw new Error(
      (data && typeof data === 'object' && 'error' in data && data.error) ||
        'Failed to update preset'
    );
  }

  if (!data || !('id' in data)) {
    throw new Error('Invalid preset response');
  }

  return data;
}

// Delete a preset
export async function deletePreset(id: number): Promise<void> {
  const res = await fetch(`/api/presets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete preset');
}

// Group presets by their group field
export function getPresetsByGroup(presets: Preset[]): Record<string, Preset[]> {
  const grouped: Record<string, Preset[]> = {};

  for (const preset of presets) {
    const group = preset.group || 'other';
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(preset);
  }

  return grouped;
}

// Apply preset to generate Cookie[] template
export function applyPreset(preset: Preset): {
  websiteName: string;
  cookies: Cookie[];
  showAdvanced: boolean;
} {
  if (preset.type === 'simple') {
    return {
      websiteName: preset.name,
      cookies: preset.cookies.map((c) => ({ name: c.name, value: '' })),
      showAdvanced: false,
    };
  } else if (preset.type === 'full') {
    return {
      websiteName: preset.name,
      cookies: preset.cookies.map((c) => ({
        name: c.name,
        value: '',
        domain: c.domain,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite,
        prioritas: c.prioritas,
      })),
      showAdvanced: true,
    };
  } else {
    // credentials type
    return {
      websiteName: preset.name,
      cookies: [],
      showAdvanced: false,
    };
  }
}
