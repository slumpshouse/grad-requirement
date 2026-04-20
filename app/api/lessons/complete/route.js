import { requireAuth } from '@/lib/middleware.js';
import { awardXP, maybeUnlockMilestones, updateStreak } from '@/lib/gamification.js';

/**
 * POST /api/lessons/complete
 * Body: { lessonId }
 */
export async function POST(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { lessonId } = await request.json();
    if (!lessonId) {
      return Response.json({ error: 'Missing required field: lessonId' }, { status: 400 });
    }

    const xpResult = await awardXP(user.id, 10);
    const streakResult = await updateStreak(user.id);
    const unlockedAchievements = await maybeUnlockMilestones(user.id);

    return Response.json({
      lessonId,
      xpAwarded: 10,
      user: {
        xp: xpResult.xp,
        level: xpResult.level,
        streak: streakResult?.streak ?? xpResult.streak,
      },
      unlockedAchievements,
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return Response.json({ error: 'Failed to complete lesson' }, { status: 500 });
  }
}
