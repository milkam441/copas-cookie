import { Preset, PresetCookie, Cookie } from '@/app/types';

// Fetch all presets from API
export async function fetchPresets(): Promise<Preset[]> {
  const res = await fetch('/api/presets');
  if (!res.ok) throw new Error('Failed to fetch presets');
  return res.json();
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
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create preset');
  }
  return res.json();
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
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update preset');
  }
  return res.json();
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
