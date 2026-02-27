import { NextResponse } from 'next/server';
import { deleteExpiredEntries } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const deletedCount = deleteExpiredEntries();
    return NextResponse.json({ 
      success: true, 
      deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up entries:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup entries' },
      { status: 500 }
    );
  }
}

