import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(request: NextRequest) {
  try {
    const roomId = request.nextUrl.searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    await connectToDatabase();

    const room = await Room.findOne({ roomId });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room: {
        roomId: room.roomId,
        name: room.name,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        canvasData: room.canvasData,
      },
    });
  } catch (error) {
    console.error('[API] Get room error:', error);
    return NextResponse.json({ error: 'Failed to get room' }, { status: 500 });
  }
}
