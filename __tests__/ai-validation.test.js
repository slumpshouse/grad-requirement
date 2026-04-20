import { ruleBasedValidateGeneratedContent } from '../lib/ai.js';

describe('AI Validation Pipeline', () => {
  test('accepts valid structured beginner content', () => {
    const constraints = {
      language: 'Spanish',
      level: 'beginner',
      tense: 'present',
      dialect: 'latin_america',
    };

    const content = {
      englishSentence: 'I eat bread.',
      spanishTranslation: 'Yo como pan.',
      explanation: 'Present tense for yo form.',
      question: 'Choose translation',
      options: ['Yo como pan.', 'Yo comi pan.', 'Yo comere pan.', 'Yo comia pan.'],
      correctAnswer: 'Yo como pan.',
    };

    const result = ruleBasedValidateGeneratedContent(content, constraints);
    expect(result.pass).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  test('rejects invalid options and answer mapping', () => {
    const constraints = {
      language: 'Spanish',
      level: 'beginner',
      tense: 'present',
      dialect: 'latin_america',
    };

    const content = {
      englishSentence: 'I eat bread.',
      spanishTranslation: 'Yo comere pan manana.',
      explanation: 'Wrong tense.',
      question: 'Choose translation',
      options: ['Yo como pan.'],
      correctAnswer: 'No existe',
    };

    const result = ruleBasedValidateGeneratedContent(content, constraints);
    expect(result.pass).toBe(false);
    expect(result.criticalIssues.length).toBeGreaterThan(0);
  });
});
