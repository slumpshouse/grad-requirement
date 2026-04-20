import { prisma } from '@/lib/prisma.js';

const SKILL_TREE = ['base', 'present', 'past', 'future', 'irregular'];

export function getSkillTree() {
  return SKILL_TREE;
}

export async function getVerbProgress(userId, verb) {
  return prisma.verbMastery.findMany({
    where: { userId, verb },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function updateVerbMastery({ userId, verb, tense, isCorrect }) {
  const existing = await prisma.verbMastery.findUnique({
    where: {
      userId_verb_tense: {
        userId,
        verb,
        tense,
      },
    },
  });

  const attemptInc = 1;
  const correctInc = isCorrect ? 1 : 0;

  if (!existing) {
    return prisma.verbMastery.create({
      data: {
        userId,
        verb,
        tense,
        attempts: 1,
        correctAnswers: correctInc,
        masteryScore: isCorrect ? 20 : 0,
        unlocked: isCorrect,
      },
    });
  }

  const nextAttempts = existing.attempts + attemptInc;
  const nextCorrect = existing.correctAnswers + correctInc;
  const accuracy = nextCorrect / nextAttempts;
  const masteryScore = Math.round(accuracy * 100);

  return prisma.verbMastery.update({
    where: { id: existing.id },
    data: {
      attempts: { increment: 1 },
      correctAnswers: { increment: correctInc },
      masteryScore,
      unlocked: masteryScore >= 60,
    },
  });
}

export async function getConjugationQuestionPool(language = 'Spanish', level = 'beginner', tense = 'present', limit = 20) {
  return prisma.verbConjugation.findMany({
    where: {
      language,
      difficultyLevel: level,
      tense,
    },
    take: limit,
    orderBy: { updatedAt: 'desc' },
  });
}
