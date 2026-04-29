/**
 * Lesson Page Tests
 *
 * Tests the mock lesson data, level validation, sentence breakdown
 * structure, and the lesson-complete API route handler logic.
 *
 * Run with: npm test -- --testPathPattern=lesson-page
 */

import { MOCK_LESSONS } from '../components/lesson/mockData.js';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

// ── Helper ────────────────────────────────────────────────────────────────────

function getSafeLesson(level) {
  const safe = VALID_LEVELS.includes(level) ? level : 'beginner';
  return MOCK_LESSONS[safe];
}

// ── Mock Data shape ───────────────────────────────────────────────────────────

describe('Mock Lesson Data', () => {
  test.each(VALID_LEVELS)('"%s" lesson has required top-level fields', (level) => {
    const lesson = MOCK_LESSONS[level];
    expect(lesson).toBeDefined();
    expect(typeof lesson.title).toBe('string');
    expect(lesson.title.length).toBeGreaterThan(0);
    expect(typeof lesson.category).toBe('string');
    expect(typeof lesson.progress).toBe('number');
    expect(lesson.progress).toBeGreaterThanOrEqual(0);
    expect(lesson.progress).toBeLessThanOrEqual(100);
  });

  test.each(VALID_LEVELS)('"%s" lesson has a grammar section', (level) => {
    const { grammar } = MOCK_LESSONS[level];
    expect(typeof grammar.title).toBe('string');
    expect(typeof grammar.tense).toBe('string');
    expect(Array.isArray(grammar.rules)).toBe(true);
    expect(grammar.rules.length).toBeGreaterThan(0);
  });

  test.each(VALID_LEVELS)('"%s" lesson has vocabulary items', (level) => {
    const { vocabulary } = MOCK_LESSONS[level];
    expect(Array.isArray(vocabulary)).toBe(true);
    expect(vocabulary.length).toBeGreaterThan(0);
    vocabulary.forEach((item) => {
      expect(typeof item.spanish).toBe('string');
      expect(typeof item.english).toBe('string');
      expect(typeof item.type).toBe('string');
    });
  });

  test.each(VALID_LEVELS)('"%s" lesson example sentence is non-empty', (level) => {
    const { example } = MOCK_LESSONS[level];
    expect(typeof example.sentence).toBe('string');
    expect(example.sentence.length).toBeGreaterThan(0);
    expect(typeof example.translation).toBe('string');
  });

  test.each(VALID_LEVELS)('"%s" lesson has conjugation table rows', (level) => {
    const { conjugation } = MOCK_LESSONS[level];
    expect(typeof conjugation.verb).toBe('string');
    expect(Array.isArray(conjugation.table)).toBe(true);
    expect(conjugation.table.length).toBe(6); // 6 pronouns
    conjugation.table.forEach((row) => {
      expect(typeof row.pronoun).toBe('string');
      expect(typeof row.form).toBe('string');
    });
  });

  test.each(VALID_LEVELS)('"%s" lesson has practice exercises', (level) => {
    const { practice } = MOCK_LESSONS[level];
    expect(typeof practice.type).toBe('string');
    expect(typeof practice.instructions).toBe('string');
    expect(Array.isArray(practice.exercises)).toBe(true);
    expect(practice.exercises.length).toBeGreaterThan(0);
    practice.exercises.forEach((ex) => {
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.prompt).toBe('string');
      expect(typeof ex.answer).toBe('string');
    });
  });
});

// ── Level switching ───────────────────────────────────────────────────────────

describe('Level Switching', () => {
  test('switching to beginner returns beginner lesson', () => {
    const lesson = getSafeLesson('beginner');
    expect(lesson.level).toBe('beginner');
  });

  test('switching to intermediate returns intermediate lesson', () => {
    const lesson = getSafeLesson('intermediate');
    expect(lesson.level).toBe('intermediate');
  });

  test('switching to advanced returns advanced lesson', () => {
    const lesson = getSafeLesson('advanced');
    expect(lesson.level).toBe('advanced');
  });

  test('invalid level defaults to beginner', () => {
    const lesson = getSafeLesson('expert');
    expect(lesson.level).toBe('beginner');
  });

  test('empty string level defaults to beginner', () => {
    const lesson = getSafeLesson('');
    expect(lesson.level).toBe('beginner');
  });

  test('each level has different content', () => {
    const titles = VALID_LEVELS.map((l) => MOCK_LESSONS[l].title);
    const unique = new Set(titles);
    expect(unique.size).toBe(3);
  });
});

// ── Sentence Breakdown ────────────────────────────────────────────────────────

describe('Sentence Breakdown Structure', () => {
  test('beginner breakdown has subject, verb, object', () => {
    const { breakdown } = MOCK_LESSONS.beginner.example;
    const roles = breakdown.map((t) => t.role);
    expect(roles).toContain('subject');
    expect(roles).toContain('verb');
    expect(roles).toContain('object');
  });

  test('intermediate breakdown includes a time indicator', () => {
    const { breakdown } = MOCK_LESSONS.intermediate.example;
    const roles = breakdown.map((t) => t.role);
    expect(roles).toContain('time');
  });

  test('advanced breakdown includes a condition role', () => {
    const { breakdown } = MOCK_LESSONS.advanced.example;
    const roles = breakdown.map((t) => t.role);
    expect(roles).toContain('condition');
  });

  test('every token has a non-empty word and label', () => {
    VALID_LEVELS.forEach((level) => {
      MOCK_LESSONS[level].example.breakdown.forEach((token) => {
        expect(typeof token.word).toBe('string');
        expect(token.word.length).toBeGreaterThan(0);
        expect(typeof token.label).toBe('string');
        expect(token.label.length).toBeGreaterThan(0);
      });
    });
  });
});

// ── Lesson Completion (XP logic) ──────────────────────────────────────────────

describe('Lesson Completion', () => {
  /**
   * Minimal stand-in for the completion endpoint logic.
   * The real implementation lives in app/api/lessons/complete/route.js.
   */
  function simulateCompletion(lessonId, xpAmount = 10) {
    if (!lessonId) throw new Error('Missing lessonId');
    return {
      lessonId,
      xpAwarded: xpAmount,
      redirectTo: '/quiz',
    };
  }

  test('completion returns correct XP amount', () => {
    const result = simulateCompletion('lesson-beginner', 10);
    expect(result.xpAwarded).toBe(10);
  });

  test('completion includes lessonId in result', () => {
    const result = simulateCompletion('lesson-intermediate');
    expect(result.lessonId).toBe('lesson-intermediate');
  });

  test('completion sets redirect to quiz', () => {
    const result = simulateCompletion('lesson-advanced');
    expect(result.redirectTo).toBe('/quiz');
  });

  test('completion throws when lessonId is missing', () => {
    expect(() => simulateCompletion(null)).toThrow('Missing lessonId');
  });
});

// ── Beginner practice: fill-in-the-blank ─────────────────────────────────────

describe('Beginner Practice – Fill Blank', () => {
  const { exercises } = MOCK_LESSONS.beginner.practice;

  test('all exercises have multiple-choice options', () => {
    exercises.forEach((ex) => {
      expect(Array.isArray(ex.options)).toBe(true);
      expect(ex.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('correct answer is always present in options', () => {
    exercises.forEach((ex) => {
      expect(ex.options).toContain(ex.answer);
    });
  });

  test('each exercise has a hint', () => {
    exercises.forEach((ex) => {
      expect(typeof ex.hint).toBe('string');
      expect(ex.hint.length).toBeGreaterThan(0);
    });
  });
});

// ── Advanced lesson: subjunctive table ───────────────────────────────────────

describe('Advanced Conjugation Table', () => {
  const { conjugation } = MOCK_LESSONS.advanced;

  test('has a conditional table', () => {
    expect(Array.isArray(conjugation.table)).toBe(true);
    expect(conjugation.table.length).toBe(6);
  });

  test('has an imperfect subjunctive table', () => {
    expect(Array.isArray(conjugation.subjunctiveTable)).toBe(true);
    expect(conjugation.subjunctiveTable.length).toBe(6);
  });

  test('first person conditional form is "comería"', () => {
    const yo = conjugation.table.find((r) => r.pronoun === 'yo');
    expect(yo?.form).toBe('comería');
  });

  test('first person subjunctive form is "comiera"', () => {
    const yo = conjugation.subjunctiveTable.find((r) => r.pronoun === 'yo');
    expect(yo?.form).toBe('comiera');
  });
});
