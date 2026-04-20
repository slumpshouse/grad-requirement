import { requireAuth } from '@/lib/middleware.js';
import { prisma } from '@/lib/prisma.js';

/**
 * GET /api/auth/session
 * Get current user session info
 * Returns user data if authenticated, null if not
 */
export async function GET(request) {
  const user = await requireAuth(request);
  
  if (!user) {
    return Response.json(null, { status: 200 });
  }

  // Get fresh user data from DB to ensure we have latest stats
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      selectedLanguage: true,
      dialectPreference: true,
      level: true,
      xp: true,
      streak: true,
      createdAt: true,
    },
  });

  return Response.json(userData);
}
