import { Entry, Cookie } from '@/app/types';

const API_BASE = '/api/entries';

export async function getEntries(): Promise<Entry[]> {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch entries');
    }
    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Error fetching entries:', error);
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add entry');
    }

    const data = await response.json();
    return data.entry;
  } catch (error) {
    console.error('Error adding entry:', error);
    throw error;
  }
}

export async function deleteEntry(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete entry');
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
}

export async function getActiveEntries(): Promise<Entry[]> {
  // Server already filters expired entries, so just return all
  return getEntries();
}


