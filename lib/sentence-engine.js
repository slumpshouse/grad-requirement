import { prisma } from '@/lib/prisma.js';

const SUBJECT_PRONOUNS = ['yo', 'tu', 'el', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'usted', 'ustedes'];

export function breakdownSentence(sentence) {
  const clean = (sentence || '').trim();
  const tokens = clean.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return {
      sentence: clean,
      breakdown: [],
      subject: null,
      verb: null,
      object: null,
    };
  }

  let subjectIndex = 0;
  if (!SUBJECT_PRONOUNS.includes(tokens[0]?.toLowerCase())) {
    subjectIndex = -1;
  }

  const verbIndex = subjectIndex === 0 ? 1 : 0;
  const subject = subjectIndex === 0 ? tokens[0] : null;
  const verb = tokens[verbIndex] || null;
  const objectWords = tokens.slice(verbIndex + 1);

  const breakdown = [];
  if (subject) {
    breakdown.push({ word: subject, role: 'subject' });
  }
  if (verb) {
    breakdown.push({ word: verb, role: 'verb' });
  }
  for (const word of objectWords) {
    breakdown.push({ word, role: 'object' });
  }

  return {
    sentence: clean,
    breakdown,
    subject,
    verb,
    object: objectWords.join(' ') || null,
  };
}

export async function saveSentenceMetadata({ lessonId, language = 'Spanish', sentence, sentenceType = 'declarative', conjugationRule = null }) {
  const metadata = breakdownSentence(sentence);

  return prisma.sentence.create({
    data: {
      lessonId,
      language,
      text: sentence,
      subjectWord: metadata.subject,
      verbWord: metadata.verb,
      objectWord: metadata.object,
      conjugationRule,
      breakdown: metadata.breakdown,
      sentenceType,
    },
  });
}

export async function getSentenceTrainingSet({ lessonId, language = 'Spanish', limit = 10 }) {
  const where = lessonId ? { lessonId } : { language };
  return prisma.sentence.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
