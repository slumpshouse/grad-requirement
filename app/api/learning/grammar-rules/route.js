import { requireAuth } from '@/lib/middleware.js';
import { getGrammarRules } from '@/lib/grammar-engine.js';

/**
 * GET /api/learning/grammar-rules?language=Spanish&level=beginner&topic=present_tense
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || user.selectedLanguage || 'Spanish';
    const level = searchParams.get('level') || user.level || 'beginner';
    const topic = searchParams.get('topic') || undefined;

    const rules = await getGrammarRules(language, level, topic);
    return Response.json({ rules });
  } catch (error) {
    console.error('Error fetching grammar rules:', error);
    return Response.json({ error: 'Failed to fetch grammar rules' }, { status: 500 });
  }
}
