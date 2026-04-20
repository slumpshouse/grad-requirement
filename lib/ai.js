/**
 * AI Integration with OpenAI API
 * Requires: process.env.OPENAI_API_KEY
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. AI features will not work.');
}

/**
 * Call OpenAI API with streaming disabled for simpler responses
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Maximum tokens in response
 * @param {number} temperature - Sampling temperature
 * @returns {Promise<string>} Response text
 */
async function callOpenAI(prompt, maxTokens = 500, temperature = 0.4) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

function cleanJsonResponse(text) {
  return text.replace(/```json\n?|\n?```/g, '').trim();
}

function parseJsonResponse(text, fallback = null) {
  try {
    return JSON.parse(cleanJsonResponse(text));
  } catch {
    return fallback;
  }
}

function createFallbackGeneratedContent(topic = 'vocabulary') {
  return {
    language: 'Spanish',
    level: 'beginner',
    tense: 'present',
    englishSentence: 'I eat bread.',
    spanishTranslation: 'Yo como pan.',
    explanation: 'Use the present tense verb "como" for "I eat".',
    question: 'Choose the correct Spanish translation: "I eat bread."',
    options: ['Yo como pan.', 'Yo comi pan.', 'Yo comere pan.', 'Yo comia pan.'],
    correctAnswer: 'Yo como pan.',
    mistakeType: topic,
    type: 'multiple_choice',
  };
}

function getForbiddenGrammarPatterns(level, tense) {
  const patterns = [];
  if (level === 'beginner') {
    patterns.push(/\bhabria\b/i);
    patterns.push(/\bhubiera\b/i);
    patterns.push(/\bhubiese\b/i);
    patterns.push(/\bseria\b/i);
    patterns.push(/\bsubjuntivo\b/i);
    patterns.push(/\bpluscuamperfecto\b/i);
  }

  if (tense === 'present') {
    patterns.push(/\bmanana\b/i);
    patterns.push(/\bvoy a\s+/i);
    patterns.push(/\bcomere\b/i);
    patterns.push(/\bsera\b/i);
    patterns.push(/\bcomi\b/i);
    patterns.push(/\bfui\b/i);
  }

  return patterns;
}

function hasBasicSentenceStructure(sentence) {
  if (!sentence || typeof sentence !== 'string') return false;
  const tokens = sentence.trim().split(/\s+/);
  if (tokens.length < 3) return false;

  const hasVerbLikeToken = tokens.some((token) =>
    /(o|as|a|amos|an|es|e|imos|en)$/.test(token.toLowerCase().replace(/[.,!?;:]/g, ''))
  );

  return hasVerbLikeToken;
}

function validateDialect(sentence, dialect) {
  const issues = [];
  const lower = (sentence || '').toLowerCase();

  if (dialect === 'latin_america') {
    if (/\bvosotros\b|\bvosotras\b|\bcoche\b/.test(lower)) {
      issues.push('Contains Spain-specific forms for a Latin America dialect setting.');
    }
  }

  if (dialect === 'spain') {
    if (/\bcarro\b|\bustedes\b/.test(lower)) {
      issues.push('Contains Latin America-preferred forms for a Spain dialect setting.');
    }
  }

  return issues;
}

const BEGINNER_SLANG = [
  'guay',
  'chido',
  'chevere',
  'vale',
  'tio',
  'wey',
  'bacan',
  'pana',
];

function validateBeginnerSlang(sentence, level) {
  if (level !== 'beginner') return [];
  const lower = (sentence || '').toLowerCase();
  return BEGINNER_SLANG.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(lower));
}

export function ruleBasedValidateGeneratedContent(content, constraints) {
  const criticalIssues = [];
  const warnings = [];
  const checks = [];

  if (!content?.englishSentence || !content?.spanishTranslation || !content?.explanation) {
    criticalIssues.push('Missing required format fields: englishSentence, spanishTranslation, explanation.');
  } else {
    checks.push('required_format_fields');
  }

  const grammarPatterns = getForbiddenGrammarPatterns(constraints.level, constraints.tense);
  const grammarHits = grammarPatterns.filter((pattern) => pattern.test(content.spanishTranslation || ''));
  if (grammarHits.length > 0) {
    criticalIssues.push('Contains forbidden grammar for configured level/tense.');
  } else {
    checks.push('forbidden_grammar_check');
  }

  const slangHits = validateBeginnerSlang(content.spanishTranslation, constraints.level);
  if (slangHits.length > 0) {
    criticalIssues.push(`Contains beginner-forbidden slang: ${slangHits.join(', ')}`);
  } else {
    checks.push('slang_check');
  }

  if (!hasBasicSentenceStructure(content.spanishTranslation)) {
    criticalIssues.push('Sentence structure appears invalid (expected basic subject/verb/object shape).');
  } else {
    checks.push('basic_sentence_structure');
  }

  const dialectIssues = validateDialect(content.spanishTranslation, constraints.dialect);
  if (dialectIssues.length > 0) {
    criticalIssues.push(...dialectIssues);
  } else {
    checks.push('dialect_check');
  }

  if (!Array.isArray(content.options) || content.options.length !== 4) {
    criticalIssues.push('Question options must contain exactly 4 choices.');
  } else {
    checks.push('option_count_check');
  }

  if (!content.correctAnswer || !Array.isArray(content.options) || !content.options.includes(content.correctAnswer)) {
    criticalIssues.push('correctAnswer must exist and match one of the options.');
  } else {
    checks.push('correct_answer_check');
  }

  const score = Math.max(0, 100 - criticalIssues.length * 20 - warnings.length * 5);

  return {
    pass: criticalIssues.length === 0,
    score,
    criticalIssues,
    warnings,
    checks,
  };
}

async function teacherReviewGeneratedContent(content, constraints) {
  const prompt = `Act as a professional Spanish language teacher. Verify correctness, naturalness, and level appropriateness.

Constraints:
- Language: ${constraints.language}
- Level: ${constraints.level}
- Tense: ${constraints.tense}
- Dialect: ${constraints.dialect}

Content to review (JSON):
${JSON.stringify(content, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "isValid": true,
  "score": 92,
  "corrections": ["optional correction"],
  "explanation": "brief explanation"
}`;

  try {
    const response = await callOpenAI(prompt, 300, 0.2);
    const parsed = parseJsonResponse(response, null);
    if (!parsed || typeof parsed.isValid !== 'boolean' || typeof parsed.score !== 'number') {
      return {
        isValid: false,
        score: 0,
        corrections: ['Teacher review response was invalid JSON.'],
        explanation: 'AI reviewer returned an invalid response format.',
      };
    }

    return {
      isValid: parsed.isValid,
      score: parsed.score,
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
      explanation: parsed.explanation || '',
    };
  } catch (error) {
    console.error('Teacher review error:', error);
    return {
      isValid: false,
      score: 0,
      corrections: ['Teacher review call failed.'],
      explanation: 'AI teacher review failed to complete.',
    };
  }
}

function buildControlledGenerationPrompt(constraints, feedback = '', weakAreas = []) {
  const weaknessHint = weakAreas.length > 0
    ? `Focus extra clarity on these user weak areas: ${weakAreas.join(', ')}.`
    : 'No specific weak areas provided.';

  const feedbackHint = feedback
    ? `Fix these issues from prior attempt: ${feedback}`
    : 'No prior issues.';

  return `Generate one Spanish learning item under STRICT constraints.

Language: ${constraints.language}
Level: ${constraints.level}
Tense: ${constraints.tense} only
Dialect: ${constraints.dialect}
Topic: ${constraints.topic}

${weaknessHint}
${feedbackHint}

Rules:
- Keep vocabulary beginner-safe when level=beginner.
- Avoid slang for beginner level.
- Keep grammar natural and correct.
- Return exactly one item.

Return ONLY valid JSON in this exact format:
{
  "englishSentence": "I eat bread.",
  "spanishTranslation": "Yo como pan.",
  "explanation": "Use present tense 'como' for first person singular.",
  "question": "Choose the correct Spanish translation: I eat bread.",
  "options": ["Yo como pan.", "Yo comi pan.", "Yo comere pan.", "Yo comia pan."],
  "correctAnswer": "Yo como pan.",
  "mistakeType": "${constraints.topic}",
  "type": "multiple_choice"
}`;
}

function normalizeGeneratedContent(content, constraints) {
  if (!content || typeof content !== 'object') {
    return null;
  }

  return {
    language: constraints.language,
    level: constraints.level,
    tense: constraints.tense,
    englishSentence: content.englishSentence || '',
    spanishTranslation: content.spanishTranslation || '',
    explanation: content.explanation || '',
    question: content.question || `Choose the correct Spanish translation: "${content.englishSentence || ''}"`,
    options: Array.isArray(content.options) ? content.options : [],
    correctAnswer: content.correctAnswer || '',
    mistakeType: content.mistakeType || constraints.topic,
    type: content.type || 'multiple_choice',
  };
}

function shouldAcceptCandidate(ruleCheck, teacherReview) {
  return (
    ruleCheck.pass &&
    teacherReview.isValid &&
    teacherReview.score >= 85 &&
    ruleCheck.criticalIssues.length === 0
  );
}

export async function generateValidatedSpanishContent(options = {}) {
  const constraints = {
    language: options.language || 'Spanish',
    level: options.level || 'beginner',
    tense: options.tense || 'present',
    dialect: options.dialect || 'latin_america',
    topic: options.topic || 'vocabulary',
    maxAttempts: options.maxAttempts || 3,
  };

  const weakAreas = Array.isArray(options.weakAreas) ? options.weakAreas : [];

  let feedback = '';
  let lastAttempt = null;

  for (let attempt = 1; attempt <= constraints.maxAttempts; attempt++) {
    try {
      const generationPrompt = buildControlledGenerationPrompt(constraints, feedback, weakAreas);
      const generatedRaw = await callOpenAI(generationPrompt, 450, 0.3);
      const generatedParsed = parseJsonResponse(generatedRaw, null);
      const candidate = normalizeGeneratedContent(generatedParsed, constraints);

      if (!candidate) {
        feedback = 'Generated output was not valid JSON. Return strict JSON only.';
        continue;
      }

      const ruleCheck = ruleBasedValidateGeneratedContent(candidate, constraints);
      const teacherReview = await teacherReviewGeneratedContent(candidate, constraints);
      const accepted = shouldAcceptCandidate(ruleCheck, teacherReview);

      lastAttempt = {
        attempt,
        accepted,
        candidate,
        ruleCheck,
        teacherReview,
      };

      if (accepted) {
        return {
          accepted: true,
          attempt,
          content: candidate,
          ruleCheck,
          teacherReview,
        };
      }

      const issueList = [
        ...ruleCheck.criticalIssues,
        ...(teacherReview.corrections || []),
      ];
      feedback = issueList.join(' | ') || teacherReview.explanation || 'Improve grammar and naturalness.';
    } catch (error) {
      console.error(`Generation pipeline attempt ${attempt} failed:`, error);
      feedback = `Attempt failed due to runtime error: ${error.message}`;
    }
  }

  const fallback = createFallbackGeneratedContent(constraints.topic);
  const fallbackRule = ruleBasedValidateGeneratedContent(fallback, constraints);

  return {
    accepted: false,
    attempt: constraints.maxAttempts,
    content: fallback,
    ruleCheck: fallbackRule,
    teacherReview: {
      isValid: false,
      score: 0,
      corrections: ['Used deterministic fallback after failed generation attempts.'],
      explanation: 'All repair attempts failed the scoring gate.',
    },
    lastAttempt,
  };
}

/**
 * Generate a Spanish quiz question using AI
 * @param {string} topic - Topic for the question (grammar, vocabulary, etc)
 * @param {string} level - Difficulty level (beginner, intermediate, advanced)
 * @returns {Promise<Object>} Question object with options and correct answer
 */
export async function generateQuizQuestion(topic, level = 'beginner') {
  try {
    const result = await generateValidatedSpanishContent({
      language: 'Spanish',
      level,
      tense: 'present',
      topic,
      dialect: 'latin_america',
    });

    const content = result.content;
    return {
      question: content.question,
      options: content.options,
      correctAnswer: content.correctAnswer,
      mistakeType: content.mistakeType,
      explanation: content.explanation,
      englishSentence: content.englishSentence,
      spanishTranslation: content.spanishTranslation,
      validation: {
        accepted: result.accepted,
        ruleScore: result.ruleCheck?.score ?? 0,
        teacherScore: result.teacherReview?.score ?? 0,
      },
    };
  } catch (error) {
    console.error('Error generating quiz question:', error);
    const fallback = createFallbackGeneratedContent(topic);
    return {
      question: fallback.question,
      options: fallback.options,
      correctAnswer: fallback.correctAnswer,
      mistakeType: fallback.mistakeType,
      explanation: fallback.explanation,
      englishSentence: fallback.englishSentence,
      spanishTranslation: fallback.spanishTranslation,
      validation: {
        accepted: false,
        ruleScore: 0,
        teacherScore: 0,
      },
    };
  }
}

/**
 * Generate an explanation for an incorrect answer using AI
 * @param {string} question - The question text
 * @param {string} userAnswer - What the user answered
 * @param {string} correctAnswer - The correct answer
 * @returns {Promise<string>} AI-generated explanation
 */
export async function generateExplanation(question, userAnswer, correctAnswer) {
  const prompt = `A student was asked: "${question}"
  
  They answered: "${userAnswer}"
  The correct answer is: "${correctAnswer}"
  
  Provide a brief, encouraging explanation (2-3 sentences) of why their answer was incorrect and why the correct answer is right. 
  Keep it simple and helpful for a language learner.`;

  try {
    return await callOpenAI(prompt, 200);
  } catch (error) {
    console.error('Error generating explanation:', error);
    return `The correct answer is "${correctAnswer}". Please review the grammar rules for this topic.`;
  }
}

/**
 * Suggest a grammar correction for a chat message
 * @param {string} message - User's message in target language
 * @param {string} language - Target language
 * @returns {Promise<string|null>} Suggested correction or null if message is fine
 */
export async function suggestGrammarCorrection(message, language = 'Spanish') {
  const prompt = `Review this ${language} language message for grammar/spelling errors: "${message}"
  
  If there are errors, provide the corrected version. If the message is correct, respond with "OK".
  Keep your response brief and only include the corrected text or "OK".`;

  try {
    const response = await callOpenAI(prompt, 100);
    if (response.trim() === 'OK') {
      return null;
    }
    return response;
  } catch (error) {
    console.error('Error suggesting grammar correction:', error);
    return null;
  }
}

/**
 * Generate multiple quiz questions at once
 * @param {number} count - Number of questions to generate
 * @param {string} topic - Topic for questions
 * @param {string} level - Difficulty level
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateMultipleQuestions(count = 5, topic = 'vocabulary', level = 'beginner') {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const question = await generateQuizQuestion(topic, level);
      questions.push(question);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error generating question ${i + 1}:`, error);
    }
  }

  return questions;
}
