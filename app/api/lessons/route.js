import { prisma } from '@/lib/prisma.js';

/**
 * GET /api/lessons
 * Get all lessons
 * Query params: ?level=beginner&topic=vocabulary
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const level = searchParams.get('level');
    const topic = searchParams.get('topic');
    const grammarTopic = searchParams.get('grammarTopic');
    const conjugationTopic = searchParams.get('conjugationTopic');
    const sentenceType = searchParams.get('sentenceType');

    const where = {};
    if (language) where.language = language;
    if (level) where.level = level;
    if (topic) where.topic = topic;
    if (grammarTopic) where.grammarTopic = grammarTopic;
    if (conjugationTopic) where.conjugationTopic = conjugationTopic;
    if (sentenceType) where.sentenceType = sentenceType;

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return Response.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
