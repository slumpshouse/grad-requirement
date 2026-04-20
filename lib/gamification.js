import { prisma } from '@/lib/prisma.js';

export function calculateLevelFromXP(xp = 0) {
  if (xp >= 3000) return 'advanced';
  if (xp >= 1000) return 'intermediate';
  return 'beginner';
}

export async function awardXP(userId, amount) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: amount },
      lastActivityDate: new Date(),
    },
    select: {
      id: true,
      xp: true,
      level: true,
      streak: true,
      lastActivityDate: true,
    },
  });

  const recalculatedLevel = calculateLevelFromXP(user.xp);
  if (recalculatedLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: recalculatedLevel },
    });
  }

  return { ...user, level: recalculatedLevel };
}

export async function updateStreak(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActivityDate: true },
  });

  if (!user) return null;

  const today = new Date();
  const lastActivity = new Date(user.lastActivityDate);

  const dayDiff = Math.floor((today.setHours(0, 0, 0, 0) - lastActivity.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));

  let nextStreak = user.streak;
  if (dayDiff === 1) {
    nextStreak += 1;
  } else if (dayDiff > 1) {
    nextStreak = 1;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      streak: nextStreak,
      lastActivityDate: new Date(),
    },
    select: {
      id: true,
      streak: true,
      xp: true,
      level: true,
    },
  });
}

export async function grantAchievement(userId, achievement) {
  const existing = await prisma.achievement.findUnique({
    where: {
      userId_code: {
        userId,
        code: achievement.code,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.achievement.create({
    data: {
      userId,
      code: achievement.code,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
    },
  });
}

export async function maybeUnlockMilestones(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, streak: true },
  });

  if (!user) return [];

  const unlocked = [];

  if (user.xp >= 500) {
    unlocked.push(await grantAchievement(userId, {
      code: 'xp_500',
      name: 'Grammar Apprentice',
      description: 'Earned 500 XP by consistent language practice.',
      category: 'grammar_mastery',
    }));
  }

  if (user.streak >= 7) {
    unlocked.push(await grantAchievement(userId, {
      code: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintained a 7-day learning streak.',
      category: 'streak',
    }));
  }

  return unlocked.filter(Boolean);
}

export async function getLeaderboard(language = 'Spanish', limit = 20) {
  return prisma.user.findMany({
    where: { selectedLanguage: language },
    orderBy: [{ xp: 'desc' }, { streak: 'desc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      level: true,
      xp: true,
      streak: true,
      selectedLanguage: true,
    },
  });
}
