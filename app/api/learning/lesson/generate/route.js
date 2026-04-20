import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';
import { analyzeUserWeakness } from '@/lib/mistakes.js';
import { generateValidatedSpanishContent } from '@/lib/ai.js';
import { saveSentenceMetadata } from '@/lib/sentence-engine.js';
import { getGrammarRules } from '@/lib/grammar-engine.js';

/**
 * POST /api/learning/lesson/generate
 * Body: { topic?, tense?, sentenceType? }
 */
export async function POST(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        selectedLanguage: true,
        level: true,
        dialectPreference: true,
      },
    });

    const weaknesses = await analyzeUserWeakness(user.id);
    const focusTopic = body.topic || weaknesses.topMistakeTypes[0]?.mistakeType || 'grammar';
    const tense = body.tense || 'present';
    const sentenceType = body.sentenceType || 'declarative';

    const generated = await generateValidatedSpanishContent({
      language: userProfile?.selectedLanguage || 'Spanish',
      level: userProfile?.level || 'beginner',
      dialect: userProfile?.dialectPreference || 'latin_america',
      tense,
      topic: focusTopic,
      weakAreas: weaknesses.topMistakeTypes.map((item) => item.mistakeType),
      maxAttempts: 3,
    });

    const content = generated.content;

    const lesson = await prisma.lesson.create({
      data: {
        title: `Personalized ${focusTopic} lesson`,
        description: `Adaptive lesson focused on ${focusTopic} and sentence building.`,
        language: userProfile?.selectedLanguage || 'Spanish',
        level: userProfile?.level || 'beginner',
        topic: focusTopic,
        grammarTopic: focusTopic,
        conjugationTopic: `${content.mistakeType}-${tense}`,
        sentenceType,
        content: `${content.englishSentence}\n${content.spanishTranslation}\n${content.explanation}`,
        duration: 12,
      },
    });

    const sentence = await saveSentenceMetadata({
      lessonId: lesson.id,
      language: userProfile?.selectedLanguage || 'Spanish',
      sentence: content.spanishTranslation,
      sentenceType,
      conjugationRule: `${tense} tense`,
    });

    const grammarRule = await prisma.grammarRule.findFirst({
      where: {
        language: userProfile?.selectedLanguage || 'Spanish',
        level: userProfile?.level || 'beginner',
        topic: focusTopic,
      },
    });

    const question = await prisma.question.create({
      data: {
        lessonId: lesson.id,
        sentenceId: sentence.id,
        grammarRuleId: grammarRule?.id || null,
        type: 'translation',
        question: content.question,
        options: content.options,
        correctAnswer: content.correctAnswer,
        explanation: content.explanation,
        mistakeType: content.mistakeType,
        errorType: `${content.mistakeType}_error`.replace('tense_error', 'conjugation_error'),
        conjugationVerb: (content.spanishTranslation.split(' ')[1] || '').toLowerCase(),
        conjugationTense: tense,
      },
      include: {
        sentence: true,
        grammarRule: true,
      },
    });

    const rules = await getGrammarRules(
      userProfile?.selectedLanguage || 'Spanish',
      userProfile?.level || 'beginner',
      focusTopic
    );

    return Response.json({
      lesson,
      sentence,
      question,
      grammarRules: rules,
      weakAreas: weaknesses,
      validation: {
        accepted: generated.accepted,
        ruleScore: generated.ruleCheck?.score ?? 0,
        teacherScore: generated.teacherReview?.score ?? 0,
      },
    });
  } catch (error) {
    console.error('Error generating personalized lesson:', error);
    return Response.json({ error: 'Failed to generate lesson' }, { status: 500 });
  }
}
