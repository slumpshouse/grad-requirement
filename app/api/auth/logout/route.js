import { clearAuthCookie } from '@/lib/auth.js';

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
export async function POST() {
  const response = Response.json({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', clearAuthCookie());
  return response;
}
