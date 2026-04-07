import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import Board from '@/models/Board';

// GET /api/boards - Get all boards for the current user
export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession();

    if (!session?.user?.email) {
      // Return empty array for unauthenticated users
      return NextResponse.json({ boards: [] });
    }

    // Import User model to find user by email
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ boards: [] });
    }

    // Get all boards for this user, sorted by updatedAt descending
    // Only return metadata, not elements or appState (too large)
    const boards = await Board.find({ owner: user._id })
      .select('_id title thumbnail updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new empty board
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession();
    const body = await request.json().catch(() => ({}));
    const { title } = body as { title?: string };

    let ownerId = null;

    if (session?.user?.email) {
      // Import User model to find user by email
      const User = (await import('@/models/User')).default;
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        ownerId = user._id;
      }
    }

    const board = await Board.create({
      title: title || 'Untitled Board',
      owner: ownerId,
      elements: [],
      appState: {},
    });

    return NextResponse.json({
      board: {
        _id: board._id,
        title: board.title,
        createdAt: board.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
