import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';
import { analyzeUserWeakness } from '@/lib/mistakes.js';

/**
 * GET /api/quiz/boss-battle
 * Returns weakness-focused quiz set for challenge mode.
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const weak = await analyzeUserWeakness(user.id);
    const targetTypes = weak.topMistakeTypes.map((w) => w.mistakeType);

    const questions = await prisma.question.findMany({
      where: {
        mistakeType: {
          in: targetTypes.length > 0 ? targetTypes : ['grammar', 'vocabulary', 'sentence_structure'],
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    });

    return Response.json({
      mode: 'boss_battle',
      targetTypes,
      questions,
    });
  } catch (error) {
    console.error('Error building boss battle quiz:', error);
    return Response.json({ error: 'Failed to generate boss battle quiz' }, { status: 500 });
  }
}
