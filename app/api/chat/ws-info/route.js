import { requireAuth } from '@/lib/middleware.js';

/**
 * GET /api/chat/ws-info
 * Returns websocket connection info for chat clients
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const port = process.env.CHAT_WS_PORT || '3001';
  const host = process.env.CHAT_WS_HOST || 'localhost';

  return Response.json({
    wsUrl: `ws://${host}:${port}`,
    room: `${user.selectedLanguage}-${user.level}`,
  });
}
