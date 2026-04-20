import { jwtVerify, SignJWT } from 'jose';
import bcryptjs from 'bcryptjs';

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'your-secret-key-change-this-in-production'
);

/**
 * Sign a JWT token with user data
 * @param {Object} payload - User data to encode
 * @returns {Promise<string>} JWT token
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
 */
export async function verifyToken(token) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return bcryptjs.hash(password, 10);
}

/**
 * Compare plain text password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hash) {
  return bcryptjs.compare(password, hash);
}

/**
 * Extract user from request headers
 * @param {Request} request - NextJS request object
 * @returns {Promise<Object|null>} User data or null
 */
export async function getUserFromRequest(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies.authToken;
  if (!token) return null;

  const user = await verifyToken(token);
  return user;
}

/**
 * Create an auth cookie header
 * @param {string} token - JWT token
 * @returns {string} Set-Cookie header value
 */
export function createAuthCookie(token) {
  return `authToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}

/**
 * Clear auth cookie
 * @returns {string} Set-Cookie header value for clearing
 */
export function clearAuthCookie() {
  return 'authToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;';
}
