import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import Room from '@/models/Room';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, elements, appState } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    await connectToDatabase();

    const room = await Room.findOneAndUpdate(
      { roomId },
      {
        canvasData: {
          elements: elements || [],
          appState: appState || {},
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Room saved successfully',
    });
  } catch (error) {
    console.error('[API] Save room error:', error);
    return NextResponse.json({ error: 'Failed to save room' }, { status: 500 });
  }
}
