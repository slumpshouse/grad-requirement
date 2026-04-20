import { prisma } from '@/lib/prisma.js';
import { inferErrorType } from '@/lib/grammar-engine.js';

/**
 * Log a mistake for the AI mistake memory system
 * @param {string} userId - User ID
 * @param {string} questionId - Question ID
 * @param {string} mistakeType - Type of mistake (grammar, vocabulary, tense, etc)
 */
export async function logMistake(userId, questionId, mistakeType) {
  return logDetailedMistake({
    userId,
    questionId,
    mistakeType,
    errorType: inferErrorType(mistakeType),
  });
}

/**
 * Log a mistake with required AI memory fields
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.questionId
 * @param {string} params.mistakeType
 * @param {string} params.errorType
 * @param {string} [params.incorrectAnswer]
 * @param {string} [params.correctAnswer]
 */
export async function logDetailedMistake({
  userId,
  questionId,
  mistakeType,
  errorType,
  incorrectAnswer,
  correctAnswer,
}) {
  try {
    // Check if this mistake already exists
    const existingMistake = await prisma.mistakeLog.findUnique({
      where: {
        userId_questionId_mistakeType: {
          userId,
          questionId,
          mistakeType,
        },
      },
    });

    if (existingMistake) {
      // Increment frequency
      return prisma.mistakeLog.update({
        where: { id: existingMistake.id },
        data: {
          frequency: { increment: 1 },
          errorType: errorType || existingMistake.errorType,
          incorrectAnswer: incorrectAnswer || existingMistake.incorrectAnswer,
          correctAnswer: correctAnswer || existingMistake.correctAnswer,
        },
      });
    } else {
      // Create new mistake log
      return prisma.mistakeLog.create({
        data: {
          userId,
          questionId,
          mistakeType,
          errorType: errorType || inferErrorType(mistakeType),
          incorrectAnswer,
          correctAnswer,
          frequency: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error logging mistake:', error);
    throw error;
  }
}

/**
 * Analyze user weakness areas - returns top 3 weak areas
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of { mistakeType, frequency, totalMistakes }
 */
export async function analyzeUserWeakness(userId) {
  try {
    const byErrorType = await prisma.mistakeLog.groupBy({
      by: ['errorType'],
      where: { userId },
      _sum: {
        frequency: true,
      },
      orderBy: {
        _sum: {
          frequency: 'desc',
        },
      },
      take: 3,
    });

    const byMistakeType = await prisma.mistakeLog.groupBy({
      by: ['mistakeType'],
      where: { userId },
      _sum: {
        frequency: true,
      },
      orderBy: {
        _sum: {
          frequency: 'desc',
        },
      },
      take: 3,
    });

    return {
      topErrorTypes: byErrorType.map((item) => ({
        errorType: item.errorType,
        totalMistakes: item._sum.frequency || 0,
      })),
      topMistakeTypes: byMistakeType.map((item) => ({
        mistakeType: item.mistakeType,
        totalMistakes: item._sum.frequency || 0,
      })),
    };
  } catch (error) {
    console.error('Error analyzing weaknesses:', error);
    return {
      topErrorTypes: [],
      topMistakeTypes: [],
    };
  }
}

/**
 * Get questions for a personalized quiz based on user weaknesses
 * @param {string} userId - User ID
 * @param {number} count - Number of questions
 * @returns {Promise<Array>} Array of questions
 */
export async function getPersonalizedQuestions(userId, count = 10) {
  try {
    // Get user's weak areas
    const weakAreas = await analyzeUserWeakness(userId);
    const mistakeTypes = weakAreas.topMistakeTypes.map((area) => area.mistakeType);

    let questions;

    // If user has weak areas, prioritize questions from those areas
    if (mistakeTypes.length > 0) {
      questions = await prisma.question.findMany({
        where: {
          mistakeType: {
            in: mistakeTypes,
          },
        },
        take: Math.ceil(count / 2),
      });

      // Fill remaining slots with random questions
      if (questions.length < count) {
        const remaining = await prisma.question.findMany({
          where: {
            mistakeType: {
              notIn: mistakeTypes,
            },
          },
          take: count - questions.length,
        });
        questions = [...questions, ...remaining];
      }
    } else {
      // No weak areas yet, return random questions
      questions = await prisma.question.findMany({
        take: count,
      });
    }

    return questions;
  } catch (error) {
    console.error('Error getting personalized questions:', error);
    return [];
  }
}
