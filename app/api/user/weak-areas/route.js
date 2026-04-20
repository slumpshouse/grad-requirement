import { requireAuth } from '@/lib/middleware.js';
import { analyzeUserWeakness } from '@/lib/mistakes.js';

/**
 * GET /api/user/weak-areas
 * Get current user's top weak areas (mistake types)
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const weakAreas = await analyzeUserWeakness(user.id);
    return Response.json(weakAreas);
  } catch (error) {
    console.error('Error analyzing weak areas:', error);
    return Response.json(
      { error: 'Failed to analyze weak areas' },
      { status: 500 }
    );
  }
}
