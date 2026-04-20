import { prisma } from '@/lib/prisma.js';
import { hashPassword, signToken, createAuthCookie } from '@/lib/auth.js';

/**
 * POST /api/auth/signup
 * Create a new user account
 * Body: { email, password, name }
 */
export async function POST(request) {
  try {
    const { email, password, name, selectedLanguage, dialectPreference } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return Response.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        selectedLanguage: selectedLanguage || 'Spanish',
        dialectPreference: dialectPreference || 'latin_america',
        level: 'beginner',
        xp: 0,
        streak: 0,
      },
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
      { status: 201 }
    );

    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
