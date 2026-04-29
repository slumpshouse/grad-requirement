import { requireAuth } from '@/lib/middleware.js';
import { MOCK_LESSONS } from '@/components/lesson/mockData';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

/**
 * GET /api/lesson?level=beginner|intermediate|advanced
 *
 * Returns structured lesson content for the requested level.
 * Falls back to beginner if the level param is missing or invalid.
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawLevel = searchParams.get('level') ?? '';
  const level = VALID_LEVELS.includes(rawLevel) ? rawLevel : 'beginner';

  const lesson = MOCK_LESSONS[level];

  return Response.json({ lesson });
}
