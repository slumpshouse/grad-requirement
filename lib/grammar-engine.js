import { prisma } from '@/lib/prisma.js';

const FORBIDDEN_BEGINNER_PATTERNS = [
  /\bhubiera\b/i,
  /\bhubiese\b/i,
  /\bhabria\b/i,
  /\bsubjuntivo\b/i,
];

const PRESENT_ONLY_PATTERNS = [
  /\bcomere\b/i,
  /\bsera\b/i,
  /\bfui\b/i,
  /\bmanana\b/i,
  /\bvoy a\b/i,
];

export function inferErrorType(mistakeType = '') {
  const normalized = (mistakeType || '').toLowerCase();
  if (normalized.includes('conjug') || normalized.includes('tense')) {
    return 'conjugation_error';
  }
  if (normalized.includes('vocab')) {
    return 'vocabulary_error';
  }
  if (normalized.includes('sentence') || normalized.includes('structure')) {
    return 'sentence_structure_error';
  }
  return 'grammar_error';
}

export function validateSentenceStructure(sentence) {
  if (!sentence || typeof sentence !== 'string') {
    return { pass: false, issues: ['Sentence must be a non-empty string.'] };
  }

  const tokens = sentence.trim().split(/\s+/);
  if (tokens.length < 3) {
    return { pass: false, issues: ['Sentence is too short for subject-verb-object practice.'] };
  }

  const hasVerb = tokens.some((token) => /(o|as|a|amos|an|es|e|imos|en)$/i.test(token.replace(/[.,!?;:]/g, '')));
  if (!hasVerb) {
    return { pass: false, issues: ['Could not detect a verb-like token in sentence.'] };
  }

  return { pass: true, issues: [] };
}

export async function getGrammarRules(language = 'Spanish', level = 'beginner', topic) {
  const where = {
    language,
    level,
  };

  if (topic) {
    where.topic = topic;
  }

  return prisma.grammarRule.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export function validateByLevelAndTense(sentence, level = 'beginner', tense = 'present') {
  const issues = [];
  const source = sentence || '';

  if (level === 'beginner') {
    for (const pattern of FORBIDDEN_BEGINNER_PATTERNS) {
      if (pattern.test(source)) {
        issues.push('Contains grammar pattern beyond beginner level.');
      }
    }
  }

  if (tense === 'present') {
    for (const pattern of PRESENT_ONLY_PATTERNS) {
      if (pattern.test(source)) {
        issues.push('Contains non-present tense pattern while present-only mode is required.');
      }
    }
  }

  return {
    pass: issues.length === 0,
    issues,
  };
}

export async function validateGeneratedQuestionWithRules(question, context) {
  const { language = 'Spanish', level = 'beginner', topic, tense = 'present' } = context || {};

  const rules = await getGrammarRules(language, level, topic);
  const sentenceCheck = validateSentenceStructure(question?.correctAnswer || question?.spanishTranslation || '');
  const levelCheck = validateByLevelAndTense(question?.correctAnswer || question?.spanishTranslation || '', level, tense);

  const issues = [...sentenceCheck.issues, ...levelCheck.issues];

  if (!Array.isArray(question?.options) || question.options.length !== 4) {
    issues.push('Question must contain exactly 4 options.');
  }

  if (!question?.correctAnswer || !question.options?.includes(question.correctAnswer)) {
    issues.push('Correct answer must be one of the options.');
  }

  if (!question?.question || !question?.explanation) {
    issues.push('Question and explanation are required.');
  }

  return {
    pass: issues.length === 0,
    score: Math.max(0, 100 - issues.length * 15),
    issues,
    appliedRuleCount: rules.length,
    rules,
  };
}
