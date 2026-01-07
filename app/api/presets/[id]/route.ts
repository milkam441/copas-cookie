import { NextRequest, NextResponse } from 'next/server';
import { getPresetById, updatePreset, deletePreset } from '@/app/lib/db';
import { PresetCookie } from '@/app/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const presetId = parseInt(id, 10);
    
    if (isNaN(presetId)) {
      return NextResponse.json({ error: 'Invalid preset ID' }, { status: 400 });
    }

    const preset = getPresetById(presetId);
    
    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error('Error fetching preset:', error);
    return NextResponse.json({ error: 'Failed to fetch preset' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const presetId = parseInt(id, 10);
    
    if (isNaN(presetId)) {
      return NextResponse.json({ error: 'Invalid preset ID' }, { status: 400 });
    }

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

    const preset = updatePreset(presetId, {
      key: key.toLowerCase().replace(/\s+/g, '-'),
      type,
      name,
      group: group.toLowerCase(),
      cookies: (cookies || []) as PresetCookie[],
    });

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    return NextResponse.json(preset);
  } catch (error: any) {
    console.error('Error updating preset:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Preset key already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update preset' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const presetId = parseInt(id, 10);
    
    if (isNaN(presetId)) {
      return NextResponse.json({ error: 'Invalid preset ID' }, { status: 400 });
    }

    const success = deletePreset(presetId);
    
    if (!success) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json({ error: 'Failed to delete preset' }, { status: 500 });
  }
}
