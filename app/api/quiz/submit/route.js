import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';
import { logDetailedMistake } from '@/lib/mistakes.js';
import { generateExplanation } from '@/lib/ai.js';
import { inferErrorType } from '@/lib/grammar-engine.js';
import { updateVerbMastery } from '@/lib/conjugation-engine.js';
import { awardXP, maybeUnlockMilestones, updateStreak } from '@/lib/gamification.js';

/**
 * POST /api/quiz/submit
 * Submit a quiz answer and record the attempt
 * Body: { questionId, userAnswer }
 */
export async function POST(request) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { questionId, userAnswer, mode } = await request.json();

    if (!questionId || !userAnswer) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return Response.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    // Calculate XP
    const xpGained = isCorrect ? (mode === 'boss_battle' ? 10 : 5) : 0;

    // Create quiz attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        questionId,
        userAnswer,
        isCorrect,
        xpGained,
      },
    });

    // Update user XP
    if (isCorrect) {
      await awardXP(user.id, xpGained);
      await updateStreak(user.id);
    } else {
      // Log the mistake if answer is wrong
      await logDetailedMistake({
        userId: user.id,
        questionId,
        mistakeType: question.mistakeType,
        errorType: question.errorType || inferErrorType(question.mistakeType),
        incorrectAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
      });
    }

    if (question.conjugationVerb && question.conjugationTense) {
      await updateVerbMastery({
        userId: user.id,
        verb: question.conjugationVerb,
        tense: question.conjugationTense,
        isCorrect,
      });
    }

    const unlockedAchievements = await maybeUnlockMilestones(user.id);

    // Generate explanation for incorrect answers
    let explanation = question.explanation;
    if (!isCorrect) {
      try {
        explanation = await generateExplanation(
          question.question,
          userAnswer,
          question.correctAnswer
        );
      } catch (error) {
        console.error('Error generating explanation:', error);
      }
    }

    return Response.json({
      attempt: {
        id: attempt.id,
        isCorrect,
        xpGained,
      },
      correctAnswer: question.correctAnswer,
      explanation,
      unlockedAchievements,
    });
  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    return Response.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
