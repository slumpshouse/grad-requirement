import { prisma } from '@/lib/prisma.js';

/**
 * GET /api/lessons/[id]
 * Get a specific lesson with its questions
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            sentence: true,
            grammarRule: true,
          },
        },
        sentences: true,
      },
    });

    if (!lesson) {
      return Response.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return Response.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return Response.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}
