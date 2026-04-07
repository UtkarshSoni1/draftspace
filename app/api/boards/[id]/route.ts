import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import Board from '@/models/Board';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/boards/[id] - Fetch a single board by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid board ID' }, { status: 400 });
    }

    await connectToDatabase();

    const board = await Board.findById(id).lean();

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

// PUT /api/boards/[id] - Update board
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid board ID' }, { status: 400 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { title, elements, appState, thumbnail } = body as {
      title?: string;
      elements?: unknown[];
      appState?: Record<string, unknown>;
      thumbnail?: string;
    };

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title;
    }
    if (elements !== undefined) {
      updateData.elements = elements;
    }
    if (appState !== undefined) {
      updateData.appState = appState;
    }
    if (thumbnail !== undefined) {
      updateData.thumbnail = thumbnail;
    }

    const board = await Board.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      updatedAt: board.updatedAt,
    });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id] - Delete board
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid board ID' }, { status: 400 });
    }

    await connectToDatabase();

    const session = await getServerSession();

    const board = await Board.findById(id);

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Check ownership if user is logged in
    if (session?.user?.email && board.owner) {
      const User = (await import('@/models/User')).default;
      const user = await User.findOne({ email: session.user.email });
      
      if (user && board.owner.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: 'Not authorized to delete this board' },
          { status: 403 }
        );
      }
    }

    await Board.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
