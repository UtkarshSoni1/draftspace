import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import Room from '@/models/Room';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid room name' }, { status: 400 });
    }

    await connectToDatabase();

    // Generate unique room ID
    const roomId = crypto.randomBytes(8).toString('hex').toUpperCase();

    const room = await Room.create({
      roomId,
      name: name.trim(),
      createdBy: token.sub || token.email,
      canvasData: {
        elements: [],
        appState: {},
      },
    });

    return NextResponse.json({
      success: true,
      room: {
        roomId: room.roomId,
        name: room.name,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('[API] Room creation error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
