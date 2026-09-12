import { MiddlewareHandler } from 'hono';

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 60; // max requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// Periodic cleanup of stale rate-limit keys
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export const authShield: MiddlewareHandler = async (c, next) => {
  const path = c.req.path;

  // Allow public health check without API key
  if (path === '/api/health' || path === '/') {
    return next();
  }

  // 1. IP Rate Limiting Check (Anti-Bot Flood)
  const clientIp =
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    c.req.header('x-real-ip') ||
    'anonymous-client';

  const now = Date.now();
  let rateLimit = rateLimitMap.get(clientIp);

  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimit = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(clientIp, rateLimit);
  } else {
    rateLimit.count += 1;
    if (rateLimit.count > RATE_LIMIT_MAX) {
      c.header('Retry-After', '60');
      return c.json(
        {
          error: 'Rate limit exceeded. Maximum 60 requests per minute allowed.',
          shieldStatus: 'BLOCKED_BY_RATE_LIMITER',
        },
        429
      );
    }
  }

  // 2. Secret Key Verification (Bot Shield)
  const configuredKey = process.env.RUNWAY_API_KEY;

  if (configuredKey) {
    const providedKey =
      c.req.header('x-runway-key') ||
      c.req.query('key') ||
      c.req.header('authorization')?.replace('Bearer ', '');

    if (!providedKey || providedKey !== configuredKey) {
      return c.json(
        {
          error: 'Unauthorized. Missing or invalid x-runway-key shield header.',
          shieldStatus: 'REJECTED_UNAUTHORIZED_BOT',
        },
        401
      );
    }
  }

  // Request authorized
  await next();
};
