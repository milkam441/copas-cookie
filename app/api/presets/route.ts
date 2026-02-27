import { NextRequest, NextResponse } from 'next/server';
import { getAllPresets, addPreset } from '@/app/lib/db';
import { PresetCookie } from '@/app/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const presets = getAllPresets();
    return NextResponse.json(presets);
  } catch (error) {
    console.error('Error fetching presets:', error);
    return NextResponse.json({ error: 'Failed to fetch presets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { key, type, name, group, cookies } = body;
    
    if (!key || !type || !name || !group) {
      return NextResponse.json(
        { error: 'Missing required fields: key, type, name, group' },
        { status: 400 }
      );
    }

    if (!['simple', 'full', 'credentials'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: simple, full, or credentials' },
        { status: 400 }
      );
    }

    const preset = addPreset({
      key: key.toLowerCase().replace(/\s+/g, '-'),
      type,
      name,
      group: group.toLowerCase(),
      cookies: (cookies || []) as PresetCookie[],
    });

    return NextResponse.json(preset, { status: 201 });
  } catch (error: any) {
    console.error('Error creating preset:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Preset key already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create preset' }, { status: 500 });
  }
}
