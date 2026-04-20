import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';

/**
 * GET /api/gamification/achievements
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: 'desc' },
    });

    return Response.json({ achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return Response.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
