import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';
import { analyzeUserWeakness } from '@/lib/mistakes.js';
import { generateValidatedSpanishContent } from '@/lib/ai.js';
import { saveSentenceMetadata } from '@/lib/sentence-engine.js';
import { getGrammarRules } from '@/lib/grammar-engine.js';

const SUPPORTED_LEVELS = ['beginner', 'intermediate', 'advanced'];

// Flat word bank keyed by category ID. Each category belongs to exactly one level.
const VOCABULARY_WORD_BANK = {
  // ── Beginner ────────────────────────────────────────────────────────────────
  'greetings-basics': [
    { english: 'hello', spanish: 'hola' },
    { english: 'goodbye', spanish: 'adios' },
    { english: 'please', spanish: 'por favor' },
    { english: 'thank you', spanish: 'gracias' },
    { english: 'yes', spanish: 'si' },
    { english: 'no', spanish: 'no' },
    { english: 'what', spanish: 'que' },
    { english: 'who', spanish: 'quien' },
    { english: 'where', spanish: 'donde' },
  ],
  'people-identity': [
    { english: 'I', spanish: 'yo' },
    { english: 'you', spanish: 'tu' },
    { english: 'he', spanish: 'el' },
    { english: 'she', spanish: 'ella' },
    { english: 'name', spanish: 'nombre' },
    { english: 'age', spanish: 'edad' },
    { english: 'friend', spanish: 'amigo' },
    { english: 'family', spanish: 'familia' },
  ],
  'basic-food': [
    { english: 'apple', spanish: 'manzana' },
    { english: 'bread', spanish: 'pan' },
    { english: 'water', spanish: 'agua' },
    { english: 'eat', spanish: 'comer' },
    { english: 'drink', spanish: 'beber' },
    { english: 'hungry', spanish: 'hambre' },
    { english: 'full', spanish: 'lleno' },
  ],
  'daily-life': [
    { english: 'house', spanish: 'casa' },
    { english: 'room', spanish: 'cuarto' },
    { english: 'sleep', spanish: 'dormir' },
    { english: 'wake up', spanish: 'despertar' },
    { english: 'go', spanish: 'ir' },
    { english: 'come', spanish: 'venir' },
  ],
  'numbers-time': [
    { english: 'one', spanish: 'uno' },
    { english: 'ten', spanish: 'diez' },
    { english: 'one hundred', spanish: 'cien' },
    { english: 'Monday', spanish: 'lunes' },
    { english: 'Friday', spanish: 'viernes' },
    { english: 'morning', spanish: 'manana' },
    { english: 'night', spanish: 'noche' },
  ],
  'basic-feelings': [
    { english: 'happy', spanish: 'feliz' },
    { english: 'sad', spanish: 'triste' },
    { english: 'tired', spanish: 'cansado' },
    { english: 'I like', spanish: 'me gusta' },
    { english: 'I don\'t like', spanish: 'no me gusta' },
  ],
  // ── Intermediate ────────────────────────────────────────────────────────────
  'shopping-money': [
    { english: 'price', spanish: 'precio' },
    { english: 'buy', spanish: 'comprar' },
    { english: 'sell', spanish: 'vender' },
    { english: 'expensive', spanish: 'caro' },
    { english: 'cheap', spanish: 'barato' },
    { english: 'store', spanish: 'tienda' },
    { english: 'cashier', spanish: 'cajero' },
  ],
  'food-dining': [
    { english: 'menu', spanish: 'menu' },
    { english: 'order', spanish: 'pedir' },
    { english: 'bill', spanish: 'cuenta' },
    { english: 'cook', spanish: 'cocinar' },
    { english: 'restaurant', spanish: 'restaurante' },
    { english: 'ingredients', spanish: 'ingredientes' },
  ],
  'travel-directions': [
    { english: 'left', spanish: 'izquierda' },
    { english: 'right', spanish: 'derecha' },
    { english: 'straight', spanish: 'recto' },
    { english: 'hotel', spanish: 'hotel' },
    { english: 'airport', spanish: 'aeropuerto' },
    { english: 'ticket', spanish: 'boleto' },
    { english: 'reservation', spanish: 'reserva' },
  ],
  'work-school': [
    { english: 'job', spanish: 'trabajo' },
    { english: 'study', spanish: 'estudiar' },
    { english: 'work', spanish: 'trabajar' },
    { english: 'meeting', spanish: 'reunion' },
    { english: 'teacher', spanish: 'maestro' },
    { english: 'boss', spanish: 'jefe' },
  ],
  'opinions-thoughts': [
    { english: 'I think', spanish: 'creo que' },
    { english: 'I believe', spanish: 'yo pienso' },
    { english: 'I agree', spanish: 'estoy de acuerdo' },
    { english: 'I disagree', spanish: 'no estoy de acuerdo' },
    { english: 'maybe', spanish: 'tal vez' },
    { english: 'probably', spanish: 'probablemente' },
  ],
  'time-use': [
    { english: 'yesterday', spanish: 'ayer' },
    { english: 'tomorrow', spanish: 'manana' },
    { english: 'before', spanish: 'antes' },
    { english: 'after', spanish: 'despues' },
    { english: 'schedule', spanish: 'horario' },
  ],
};

function capitalize(value = '') {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeCategoryId(input = '') {
  const normalized = input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z-]/g, '');

  return normalized || 'greetings';
}

function normalizeLevel(input = 'beginner') {
  const level = input.toString().trim().toLowerCase();
  return SUPPORTED_LEVELS.includes(level) ? level : 'beginner';
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildVocabularyLessonPayload(categoryId, categoryLabel, level) {
  const resolvedId = VOCABULARY_WORD_BANK[categoryId] ? categoryId : 'greetings-basics';
  const pairs = VOCABULARY_WORD_BANK[resolvedId];
  const selectedPair = pairs[Math.floor(Math.random() * pairs.length)] || pairs[0];

  const categoryDistractors = pairs
    .filter((p) => p.spanish !== selectedPair.spanish)
    .map((p) => p.spanish);

  const otherWords = Object.entries(VOCABULARY_WORD_BANK)
    .filter(([id]) => id !== resolvedId)
    .flatMap(([, words]) => words)
    .map((p) => p.spanish)
    .filter((word) => word !== selectedPair.spanish);

  const distractors = shuffle([...categoryDistractors, ...otherWords]).slice(0, 3);
  const options = shuffle([selectedPair.spanish, ...distractors]);

  const wordsList = pairs
    .map((p) => `<li><strong>${p.english}</strong> - ${p.spanish}</li>`)
    .join('');

  const safeCategoryLabel = categoryLabel || capitalize(resolvedId.replace(/-/g, ' '));

  return {
    title: `Spanish Vocabulary: ${safeCategoryLabel} (${capitalize(level)})`,
    description: `${capitalize(level)} ${safeCategoryLabel.toLowerCase()} vocabulary with category-based word groups.`,
    content: `
      <h2>${safeCategoryLabel} Vocabulary (${capitalize(level)})</h2>
      <p>Practice this category by learning and recalling these words:</p>
      <ul>${wordsList}</ul>
      <p><strong>Focus phrase:</strong> ${selectedPair.english} = ${selectedPair.spanish}</p>
    `,
    question: `What is the Spanish word for "${selectedPair.english}"?`,
    options,
    correctAnswer: selectedPair.spanish,
    explanation: `In the ${safeCategoryLabel.toLowerCase()} category, "${selectedPair.english}" translates to "${selectedPair.spanish}".`,
    englishSentence: selectedPair.english,
    spanishTranslation: selectedPair.spanish,
    mistakeType: 'vocabulary',
    grammarTopic: `vocabulary_${resolvedId}_${level}`,
    conjugationTopic: `vocabulary-${resolvedId}-${level}`,
    lessonLevel: level,
  };
}

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
    const requestedLevel = normalizeLevel(body.vocabularyLevel || userProfile?.level || 'beginner');
    const lessonLevel = focusTopic === 'vocabulary' ? requestedLevel : (userProfile?.level || 'beginner');
    const vocabularyCategoryId = normalizeCategoryId(body.vocabularyCategoryId || body.vocabularyCategory || '');
    const vocabularyCategory = typeof body.vocabularyCategory === 'string' ? body.vocabularyCategory.trim() : '';
    const generationTopic = focusTopic === 'vocabulary' && vocabularyCategory
      ? `${focusTopic} (${vocabularyCategory})`
      : focusTopic;
    const tense = body.tense || 'present';
    const sentenceType = body.sentenceType || 'declarative';

    let content;
    let lessonTitle;
    let lessonDescription;
    let grammarTopic;
    let conjugationTopic;
    let lessonContent;
    let validation = {
      accepted: true,
      ruleScore: 100,
      teacherScore: 100,
    };

    if (focusTopic === 'vocabulary' && vocabularyCategoryId) {
      const vocabPayload = buildVocabularyLessonPayload(vocabularyCategoryId, vocabularyCategory, lessonLevel);
      content = {
        englishSentence: vocabPayload.englishSentence,
        spanishTranslation: vocabPayload.spanishTranslation,
        explanation: vocabPayload.explanation,
        question: vocabPayload.question,
        options: vocabPayload.options,
        correctAnswer: vocabPayload.correctAnswer,
        mistakeType: vocabPayload.mistakeType,
      };
      lessonTitle = vocabPayload.title;
      lessonDescription = vocabPayload.description;
      grammarTopic = vocabPayload.grammarTopic;
      conjugationTopic = vocabPayload.conjugationTopic;
      lessonContent = vocabPayload.content;
      validation = {
        accepted: true,
        ruleScore: 100,
        teacherScore: 100,
      };
    } else {
      const generated = await generateValidatedSpanishContent({
        language: userProfile?.selectedLanguage || 'Spanish',
        level: userProfile?.level || 'beginner',
        dialect: userProfile?.dialectPreference || 'latin_america',
        tense,
        topic: generationTopic,
        weakAreas: weaknesses.topMistakeTypes.map((item) => item.mistakeType),
        maxAttempts: 3,
      });

      content = generated.content;
      lessonTitle = focusTopic === 'vocabulary' && vocabularyCategory
        ? `Spanish Vocabulary: ${vocabularyCategory}`
        : `Personalized ${focusTopic} lesson`;
      lessonDescription = focusTopic === 'vocabulary' && vocabularyCategory
        ? `Adaptive vocabulary lesson focused on ${vocabularyCategory.toLowerCase()} words and usage.`
        : `Adaptive lesson focused on ${focusTopic} and sentence building.`;
      grammarTopic = focusTopic;
      conjugationTopic = `${content.mistakeType}-${tense}`;
      lessonContent = `${content.englishSentence}\n${content.spanishTranslation}\n${content.explanation}`;
      validation = {
        accepted: generated.accepted,
        ruleScore: generated.ruleCheck?.score ?? 0,
        teacherScore: generated.teacherReview?.score ?? 0,
      };
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: lessonTitle,
        description: lessonDescription,
        language: userProfile?.selectedLanguage || 'Spanish',
        level: lessonLevel,
        topic: focusTopic,
        grammarTopic,
        conjugationTopic,
        sentenceType,
        content: lessonContent,
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
      validation,
    });
  } catch (error) {
    console.error('Error generating personalized lesson:', error);
    return Response.json({ error: 'Failed to generate lesson' }, { status: 500 });
  }
}
