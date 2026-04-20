import { verifyToken } from '@/lib/auth.js';

/**
 * Authentication middleware to protect API routes
 * Extracts and verifies JWT token from cookies
 * 
 * Usage in API routes:
 * export async function GET(request) {
 *   const user = await requireAuth(request);
 *   if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   // User is authenticated, user contains { id, email, name, etc }
 * }
 */
export async function requireAuth(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, value] = c.trim().split('=');
      return [key, value];
    })
  );

  const token = cookies.authToken;
  if (!token) return null;

  const user = await verifyToken(token);
  return user;
}

/**
 * Verify user is authenticated, return 401 if not
 * Combines requireAuth check with standard response
 */
export async function withAuth(request, handler) {
  const user = await requireAuth(request);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return handler(user, request);
}
