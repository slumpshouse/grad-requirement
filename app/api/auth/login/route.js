import { prisma } from '@/lib/prisma.js';
import { comparePassword, signToken, createAuthCookie } from '@/lib/auth.js';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Body: { email, password }
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return Response.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last activity
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActivityDate: new Date() },
    });

    // Create JWT token
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Create response with auth cookie
    const response = Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          selectedLanguage: user.selectedLanguage,
          dialectPreference: user.dialectPreference,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
        },
      },
      { status: 200 }
    );

    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
