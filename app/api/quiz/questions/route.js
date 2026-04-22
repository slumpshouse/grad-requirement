import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';
import { analyzeUserWeakness, getPersonalizedQuestions } from '@/lib/mistakes.js';
import { generateValidatedSpanishContent } from '@/lib/ai.js';

async function getOrCreateAIGeneratedLesson(level, topic, language = 'Spanish') {
  const title = `AI Practice - ${level} - ${topic}`;
  const existing = await prisma.lesson.findFirst({
    where: { title, level, language, topic },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.lesson.create({
    data: {
      title,
      description: `Auto-generated ${level} ${language} practice focused on ${topic}.`,
      language,
      level,
      content: 'AI-generated practice content for personalized reinforcement.',
      topic,
      duration: 10,
    },
    select: { id: true },
  });

  return created.id;
}

async function generateAndPersistQuestion(user, weakAreas, level, language) {
  const topWeakArea = weakAreas.topMistakeTypes[0]?.mistakeType || 'vocabulary';
  const weakAreaNames = weakAreas.topMistakeTypes.map((w) => w.mistakeType);

  const generated = await generateValidatedSpanishContent({
    language,
    level,
    tense: 'present',
    dialect: 'latin_america',
    topic: topWeakArea,
    weakAreas: weakAreaNames,
    maxAttempts: 3,
  });

  const content = generated.content;
  const lessonId = await getOrCreateAIGeneratedLesson(level, content.mistakeType, language);

  return prisma.question.create({
    data: {
      lessonId,
      type: content.type || 'multiple_choice',
      question: content.question,
      options: content.options,
      correctAnswer: content.correctAnswer,
      explanation: content.explanation,
      mistakeType: content.mistakeType,
    },
  });
}

/**
 * GET /api/quiz/questions
 * Get personalized quiz questions for authenticated user
 * Query params: ?limit=10
 */
export async function GET(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const aiEnabled = searchParams.get('ai') !== '0';
    const requestedLessonId = searchParams.get('lessonId');

    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .filter(Boolean)
        .map((c) => {
          const [key, value] = c.trim().split('=');
          return [key, value];
        })
    );

    const lastLearnedLessonId = requestedLessonId || cookies.lastLearnedLessonId;

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        level: true,
        selectedLanguage: true,
      },
    });

    let questions = [];

    // Prioritize quiz questions from the most recently learned lesson.
    if (lastLearnedLessonId) {
      questions = await prisma.question.findMany({
        where: { lessonId: lastLearnedLessonId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    }

    // Fall back to personalized questions when no lesson-specific content exists.
    if (questions.length === 0) {
      questions = await getPersonalizedQuestions(user.id, limit);
    }

    if (aiEnabled && questions.length < limit && !lastLearnedLessonId) {
      const weakAreas = await analyzeUserWeakness(user.id);
      const level = userProfile?.level || 'beginner';
      const language = userProfile?.selectedLanguage || 'Spanish';

      // Generate only the minimum needed to fill the request.
      const missingCount = limit - questions.length;
      for (let i = 0; i < missingCount; i++) {
        try {
          const generatedQuestion = await generateAndPersistQuestion(user, weakAreas, level, language);
          questions.push(generatedQuestion);
        } catch (generationError) {
          console.error('Error generating validated AI question:', generationError);
          break;
        }
      }
    }

    return Response.json({ questions, lessonId: lastLearnedLessonId || null });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return Response.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
