import { inferErrorType, validateSentenceStructure, validateByLevelAndTense } from '../lib/grammar-engine.js';
import { breakdownSentence } from '../lib/sentence-engine.js';
import { getSkillTree } from '../lib/conjugation-engine.js';

describe('Learning Engine', () => {
  test('infers required mistake categories', () => {
    expect(inferErrorType('grammar')).toBe('grammar_error');
    expect(inferErrorType('conjugation')).toBe('conjugation_error');
    expect(inferErrorType('vocabulary')).toBe('vocabulary_error');
    expect(inferErrorType('sentence_structure')).toBe('sentence_structure_error');
  });

  test('validates basic sentence structure', () => {
    const valid = validateSentenceStructure('Yo como manzana');
    const invalid = validateSentenceStructure('Hola');

    expect(valid.pass).toBe(true);
    expect(invalid.pass).toBe(false);
  });

  test('enforces beginner/present constraints', () => {
    const pass = validateByLevelAndTense('Yo como pan', 'beginner', 'present');
    const fail = validateByLevelAndTense('Yo comere pan manana', 'beginner', 'present');

    expect(pass.pass).toBe(true);
    expect(fail.pass).toBe(false);
  });

  test('breaks down sentence metadata', () => {
    const data = breakdownSentence('Yo leo libros');

    expect(data.subject).toBe('Yo');
    expect(data.verb).toBe('leo');
    expect(data.object).toBe('libros');
    expect(data.breakdown.length).toBeGreaterThanOrEqual(3);
  });

  test('exposes conjugation skill tree', () => {
    const tree = getSkillTree();

    expect(tree).toEqual(['base', 'present', 'past', 'future', 'irregular']);
  });
});
