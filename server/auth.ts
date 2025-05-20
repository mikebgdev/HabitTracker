import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'habitmaster-secret-key-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = 10;

interface JwtPayload {
  userId: number;
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hash Hashed password
 * @returns Boolean indicating if password is valid
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 * @param payload Data to include in token
 * @returns JWT token string
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a refresh token
 * @param userId User ID
 * @returns Refresh token string
 */
export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verify a refresh token
 * @param token Refresh token string
 * @returns User ID from token or null if invalid
 */
export function verifyRefreshToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; type: string };
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
