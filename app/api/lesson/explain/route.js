import { requireAuth } from '@/lib/middleware.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * POST /api/lesson/explain
 * Body: { sentence, answer, context, level }
 *
 * Returns structured explanation:
 * { meaning, correctAnswer, whyCorrect, grammarRule, verbForms, tip, source }
 */
export async function POST(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sentence, answer, context, level = 'beginner' } = body;

  if (!sentence || typeof sentence !== 'string' || sentence.trim().length === 0) {
    return Response.json({ error: 'Missing required field: sentence' }, { status: 400 });
  }

  if (!OPENAI_API_KEY) {
    return Response.json({ ...buildFallback(sentence, answer), source: 'fallback' });
  }

  const levelInstructions = {
    beginner: 'This is a beginner student. Use very simple, encouraging English. Avoid grammar jargon — say "verb ending" not "conjugation paradigm". Keep each field to 1–2 short sentences. Be warm and supportive.',
    intermediate: 'This is an intermediate student. You may use grammar terms like tense, conjugation, and agreement. Give a bit more detail. Keep a positive, coaching tone.',
    advanced: 'This is an advanced student. Provide deeper nuance — mention tense, mood, register, and regional differences where relevant. Treat them as a capable adult learner.',
  };

  const systemPrompt = `You are Señora Lingua, an enthusiastic and patient Spanish teacher with 15 years of classroom experience. You love helping students unlock the beauty of Spanish.

Your teaching style:
- Always start from what the student already knows before introducing new concepts.
- Use relatable English analogies to explain Spanish grammar patterns.
- Celebrate correct thinking even when the answer was wrong — acknowledge what the student got right before correcting.
- Use simple, clear language matched to the student's level.
- Always leave the student with one actionable tip they can immediately apply.
- Never make the student feel embarrassed. Mistakes are part of learning.`;

  const prompt = `A ${level} Spanish student just answered a practice exercise. Help them understand it as their teacher.

Exercise: "${sentence.trim()}"
${answer ? `Correct answer: "${answer.trim()}"` : ''}
${context ? `Additional context: ${context.trim()}` : ''}

${levelInstructions[level] || levelInstructions.beginner}

Respond ONLY with a valid JSON object in exactly this structure (no markdown, no extra text):
{
  "meaning": "What the full sentence means in English.",
  "correctAnswer": "State clearly what the correct answer is.",
  "whyCorrect": "Explain why that specific word/form is correct — in a warm, teacher-like way.",
  "grammarRule": "The grammar or conjugation rule that applies here, explained simply.",
  "verbForms": ["yo → form", "tú → form", "él/ella → form", "nosotros → form"],
  "tip": "One memorable, actionable tip the student can use right away."
}

Rules:
- Keep each field concise (1–3 sentences max).
- verbForms should only include the most relevant 3–6 forms.
- Do not include markdown formatting inside the JSON values.
- Write as Señora Lingua — warm, clear, encouraging.`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!openaiRes.ok) throw new Error(`OpenAI ${openaiRes.status}`);

    const data = await openaiRes.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty OpenAI response');

    const parsed = parseStructured(raw);
    return Response.json({ ...parsed, source: 'ai' });
  } catch (error) {
    console.error('AI explain error:', error);
    return Response.json({ ...buildFallback(sentence, answer), source: 'fallback' });
  }
}

function parseStructured(text) {
  try {
    const clean = text.replace(/```json\n?|\n?```/g, '').trim();
    const obj = JSON.parse(clean);
    return {
      meaning: obj.meaning || '',
      correctAnswer: obj.correctAnswer || '',
      whyCorrect: obj.whyCorrect || '',
      grammarRule: obj.grammarRule || '',
      verbForms: Array.isArray(obj.verbForms) ? obj.verbForms : [],
      tip: obj.tip || '',
    };
  } catch {
    // If JSON parse fails, surface whatever text came back as a tip
    return buildFallback('', '');
  }
}

function buildFallback(sentence, answer) {
  return {
    meaning: sentence ? `"${sentence}" is the Spanish sentence you are practising — let's break it down together!` : '',
    correctAnswer: answer ? `The correct answer is "${answer}". Great effort for trying!` : '',
    whyCorrect: 'In Spanish, verbs change their ending to match who is doing the action — just like how in English we say "I am" but "she is". The ending tells us who!',
    grammarRule: 'This is called verb conjugation. Each subject (yo, tú, él/ella, nosotros…) gets its own special ending. Once you learn the pattern for one verb, you can apply it to hundreds more!',
    verbForms: ['yo → -o', 'tú → -es / -as', 'él/ella → -e / -a', 'nosotros → -emos / -amos'],
    tip: 'Every time you see a verb in Spanish, ask yourself: who is doing this action? That tells you which ending to use. Practice this with verbs you already know!',
  };
}
