import { requireAuth } from '@/lib/middleware.js';
import { getLeaderboard } from '@/lib/gamification.js';

/**
 * GET /api/gamification/leaderboard
 * Query params: ?language=Spanish&limit=20
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'Spanish';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const leaderboard = await getLeaderboard(language, limit);
    return Response.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
