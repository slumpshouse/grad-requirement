import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';
import { analyzeUserWeakness, getPersonalizedQuestions } from '@/lib/mistakes.js';
import { generateValidatedSpanishContent } from '@/lib/ai.js';
import { MOCK_LESSONS } from '@/components/lesson/mockData.js';
import { enrichLessonPractice } from '@/lib/lesson-practice.js';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

const GRAMMAR_DISTRACTORS = [
  'Spanish verbs never change by subject.',
  'Word order is always object + verb + subject.',
  'Past and present forms are always identical.',
  'Conjugation is optional in Spanish sentences.',
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueOptions(options, fallbackCorrect, minCount = 4) {
  const deduped = [...new Set(options.filter(Boolean))];
  if (!deduped.includes(fallbackCorrect)) deduped.unshift(fallbackCorrect);
  while (deduped.length < minCount) {
    deduped.push(deduped[deduped.length - 1] || fallbackCorrect);
  }
  return shuffle(deduped).slice(0, minCount);
}

function normalizeText(value) {
  return String(value || '').trim();
}

function buildPracticeQuestions(lesson) {
  const exercises = lesson.practice?.exercises || [];
  const answerPool = exercises.map((exercise) => normalizeText(exercise.answer)).filter(Boolean);

  return exercises.map((exercise, index) => {
    const correctAnswer = normalizeText(exercise.answer);
    const exerciseOptions = Array.isArray(exercise.options)
      ? exercise.options
      : answerPool.filter((answer) => answer !== correctAnswer).slice(0, 3);

    return {
      type: 'multiple_choice',
      question: exercise.prompt,
      options: uniqueOptions(exerciseOptions, correctAnswer),
      correctAnswer,
      explanation: exercise.hint || 'Apply the same pattern used in this practice section.',
      mistakeType: 'practice',
      errorType: 'sentence_structure_error',
      sortKey: `practice-${index}`,
    };
  });
}

function buildGrammarQuestions(lesson) {
  const questions = [];
  const rules = lesson.grammar?.rules || [];

  if (rules.length > 0) {
    const correctRule = rules[0];
    questions.push({
      type: 'multiple_choice',
      question: `Which grammar rule is part of this lesson: ${lesson.grammar?.title || 'Grammar'}?`,
      options: uniqueOptions([correctRule, ...GRAMMAR_DISTRACTORS], correctRule),
      correctAnswer: correctRule,
      explanation: `This lesson highlights: ${correctRule}`,
      mistakeType: 'grammar',
      errorType: 'grammar_error',
      sortKey: 'grammar-rule',
    });
  }

  if (lesson.grammar?.tense) {
    const correctTense = lesson.grammar.tense;
    questions.push({
      type: 'multiple_choice',
      question: 'What tense or mood is the focus of this lesson?',
      options: uniqueOptions([
        correctTense,
        'Preterite Tense',
        'Conditional / Subjunctive',
        'Present Tense',
      ], correctTense),
      correctAnswer: correctTense,
      explanation: `The lesson focus is ${correctTense}.`,
      mistakeType: 'grammar',
      errorType: 'grammar_error',
      sortKey: 'grammar-tense',
    });
  }

  return questions;
}

function buildConjugationQuestions(lesson) {
  const rows = lesson.conjugation?.table || [];
  const forms = rows.map((row) => row.form).filter(Boolean);

  return rows.slice(0, 3).map((row, index) => ({
    type: 'multiple_choice',
    question: `Choose the correct form of "${lesson.conjugation.verb}" for "${row.pronoun}".`,
    options: uniqueOptions(forms, row.form),
    correctAnswer: row.form,
    explanation: `For ${row.pronoun}, the correct form is ${row.form}.`,
    mistakeType: 'tense',
    errorType: 'conjugation_error',
    conjugationVerb: lesson.conjugation.verb,
    conjugationTense: lesson.grammar?.tense || 'present',
    sortKey: `conjugation-${index}`,
  }));
}

function buildVocabularyQuestions(lesson) {
  const vocab = lesson.vocabulary || [];
  const englishWords = vocab.map((item) => item.english);

  return vocab.slice(0, 4).map((item, index) => ({
    type: 'multiple_choice',
    question: `What does "${item.spanish}" mean in English?`,
    options: uniqueOptions(englishWords, item.english),
    correctAnswer: item.english,
    explanation: `"${item.spanish}" means "${item.english}".`,
    mistakeType: item.type === 'connector' ? 'conjunction' : 'vocabulary',
    errorType: 'vocabulary_error',
    sortKey: `vocabulary-${index}`,
  }));
}

function selectDiverseQuestions(questions, limit) {
  const byType = {
    practice: [],
    vocabulary: [],
    conjunction: [],
    grammar: [],
    tense: [],
  };

  questions.forEach((question) => {
    if (byType[question.mistakeType]) {
      byType[question.mistakeType].push(question);
    } else {
      byType.grammar.push(question);
    }
  });

  const selected = [];
  ['practice', 'vocabulary', 'conjunction', 'grammar', 'tense'].forEach((type) => {
    if (byType[type].length > 0) {
      selected.push(byType[type][0]);
    }
  });

  const selectedKeys = new Set(selected.map((item) => `${item.question}|${item.correctAnswer}`));
  const remaining = questions.filter((item) => !selectedKeys.has(`${item.question}|${item.correctAnswer}`));

  return [...selected, ...remaining].slice(0, limit);
}

function buildLessonBasedQuestions(lesson) {
  const practiceQuestions = buildPracticeQuestions(lesson);
  const grammarQuestions = buildGrammarQuestions(lesson);
  const conjugationQuestions = buildConjugationQuestions(lesson);
  const vocabularyQuestions = buildVocabularyQuestions(lesson);

  const allQuestions = shuffle([
    ...practiceQuestions,
    ...grammarQuestions,
    ...conjugationQuestions,
    ...vocabularyQuestions,
  ]);

  return selectDiverseQuestions(allQuestions, 10);
}

async function getOrCreateLessonFromContext(level, topic) {
  const safeLevel = VALID_LEVELS.includes(level) ? level : 'beginner';
  const safeTopic = topic?.trim() || 'core';
  const title = `Lesson Quiz - ${safeLevel} - ${safeTopic}`;

  const existing = await prisma.lesson.findFirst({
    where: {
      title,
      level: safeLevel,
      language: 'Spanish',
      topic: safeTopic,
    },
    select: { id: true },
  });

  if (existing) return existing.id;

  const sourceLesson = MOCK_LESSONS[safeLevel] || MOCK_LESSONS.beginner;
  const created = await prisma.lesson.create({
    data: {
      title,
      description: `Quiz generated from ${safeLevel} lesson content (${safeTopic}).`,
      language: 'Spanish',
      level: safeLevel,
      content: sourceLesson.title,
      topic: safeTopic,
      grammarTopic: sourceLesson.grammar?.title || null,
      conjugationTopic: sourceLesson.conjugation?.verb || null,
      sentenceType: sourceLesson.practice?.type || null,
      duration: 10,
    },
    select: { id: true },
  });

  return created.id;
}

async function ensureContextLessonQuestions(lessonId, lessonData) {
  const enrichedLesson = enrichLessonPractice(lessonData);
  const questionPayloads = buildLessonBasedQuestions(enrichedLesson);
  if (questionPayloads.length === 0) return;

  await prisma.question.deleteMany({ where: { lessonId } });
  await prisma.question.createMany({
    data: questionPayloads.map((q) => ({
      lessonId,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      mistakeType: q.mistakeType,
      errorType: q.errorType,
      conjugationVerb: q.conjugationVerb || null,
      conjugationTense: q.conjugationTense || null,
    })),
  });
}

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
    const requestedLevel = searchParams.get('level');
    const requestedTopic = searchParams.get('topic') || 'core';

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

    let resolvedLessonId = requestedLessonId || null;

    if (!resolvedLessonId && VALID_LEVELS.includes(requestedLevel)) {
      resolvedLessonId = await getOrCreateLessonFromContext(requestedLevel, requestedTopic);
      await ensureContextLessonQuestions(resolvedLessonId, MOCK_LESSONS[requestedLevel]);
    }

    const lastLearnedLessonId = resolvedLessonId || cookies.lastLearnedLessonId;

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
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      questions = selectDiverseQuestions(questions, limit);
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
