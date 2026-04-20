import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';
import { suggestGrammarCorrection } from '@/lib/ai.js';

/**
 * GET /api/chat/messages
 * Get recent chat messages from a room
 * Query params: ?room=Spanish&limit=50
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room') || 'Spanish';
    const levelGroup = searchParams.get('levelGroup') || user.level || 'beginner';
    const limit = parseInt(searchParams.get('limit')) || 50;

    const messages = await prisma.chatMessage.findMany({
      where: { room, levelGroup },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return Response.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/messages
 * Send a new chat message
 * Body: { room, message }
 */
export async function POST(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { room, message, levelGroup } = await request.json();

    if (!room || !message) {
      return Response.json(
        { error: 'Missing required fields: room, message' },
        { status: 400 }
      );
    }

    // Get AI suggestion for grammar correction
    let suggestedCorrection = null;
    try {
      suggestedCorrection = await suggestGrammarCorrection(message, room);
    } catch (error) {
      console.error('Error getting grammar suggestion:', error);
    }

    // Create chat message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        room,
        levelGroup: levelGroup || user.level || 'beginner',
        message,
        suggestedCorrection,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return Response.json({ message: chatMessage }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return Response.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
