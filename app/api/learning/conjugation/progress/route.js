import { requireAuth } from '@/lib/middleware.js';
import { getVerbProgress } from '@/lib/conjugation-engine.js';

/**
 * GET /api/learning/conjugation/progress?verb=comer
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const verb = searchParams.get('verb');

    if (!verb) {
      return Response.json({ error: 'Missing required query param: verb' }, { status: 400 });
    }

    const progress = await getVerbProgress(user.id, verb.toLowerCase());
    return Response.json({ verb, progress });
  } catch (error) {
    console.error('Error fetching conjugation progress:', error);
    return Response.json({ error: 'Failed to fetch conjugation progress' }, { status: 500 });
  }
}
