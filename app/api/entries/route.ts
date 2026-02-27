import { NextRequest, NextResponse } from 'next/server';
import { getAllEntries, addEntry, deleteExpiredEntries } from '@/app/lib/db';
import { Entry, Cookie } from '@/app/types';

export const runtime = 'nodejs';

// Clean expired entries on startup and periodically
deleteExpiredEntries();

export async function GET() {
  try {
    // Clean expired entries before fetching
    deleteExpiredEntries();
    
    const entries = getAllEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { website, cookies, username, password } = body;

    // Validate website is provided
    if (!website || !website.trim()) {
      return NextResponse.json(
        { error: 'Website name is required' },
        { status: 400 }
      );
    }

    // Validate cookies array format if provided
    if (cookies !== undefined && (!Array.isArray(cookies))) {
      return NextResponse.json(
        { error: 'Cookies must be an array' },
        { status: 400 }
      );
    }

    // Validate that either cookies or credentials are provided
    const hasCookies = Array.isArray(cookies) && cookies.length > 0;
    const hasUsername = username && username.trim();
    const hasPassword = password && password.trim();
    const hasCredentials = hasUsername || hasPassword;

    if (!hasCookies && !hasCredentials) {
      return NextResponse.json(
        { error: 'Either cookies or username/password is required' },
        { status: 400 }
      );
    }

    const newEntry: Entry = {
      id: Date.now(),
      website: website.trim(),
      cookies: (cookies as Cookie[]) || [],
      username: username?.trim() || undefined,
      password: password?.trim() || undefined,
      createdAt: Date.now(),
    };

    const savedEntry = addEntry(newEntry);
    
    return NextResponse.json({ entry: savedEntry }, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

