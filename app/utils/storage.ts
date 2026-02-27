import { Entry, Cookie } from '@/app/types';

const API_BASE = '/api/entries';

async function safeReadJson<T>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text();

    if (!raw) return null;

    if (contentType.includes('application/json')) {
      return JSON.parse(raw) as T;
    }

    if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      return JSON.parse(raw) as T;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getEntries(): Promise<Entry[]> {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      return [];
    }
    const data = await safeReadJson<{ entries?: Entry[] }>(response);
    if (!data) return [];
    return data.entries || [];
  } catch (error) {
    console.warn('Unable to fetch entries. Returning empty list.');
    return [];
  }
}

export async function addEntry(
  website: string,
  cookies: Cookie[],
  username?: string,
  password?: string
): Promise<Entry> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        website,
        cookies,
        username,
        password,
      }),
    });

    const data = await safeReadJson<{ entry?: Entry; error?: string }>(response);

    if (!response.ok) {
      throw new Error(data?.error || `Failed to add entry (${response.status})`);
    }

    if (!data?.entry) {
      throw new Error('Invalid entry response');
    }

    return data.entry;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to add entry');
  }
}

export async function deleteEntry(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    const data = await safeReadJson<{ error?: string }>(response);

    if (!response.ok) {
      throw new Error(data?.error || `Failed to delete entry (${response.status})`);
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete entry');
  }
}

export async function getActiveEntries(): Promise<Entry[]> {
  // Server already filters expired entries, so just return all
  return getEntries();
}


