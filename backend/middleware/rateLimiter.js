const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now - entry.start > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}, 60 * 1000);

const getKey = (req) => {
  return req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
};

const loginRateLimiter = (req, res, next) => {
  const key = getKey(req);
  const now = Date.now();
  let entry = attempts.get(key);

  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { count: 0, start: now };
    attempts.set(key, entry);
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.start)) / 1000);
    const minutes = Math.ceil(retryAfter / 60);
    return res.status(429).json({
      message: `Too many login attempts. Please try again after ${minutes} minute${minutes > 1 ? 's' : ''}.`,
      retryAfter,
    });
  }

  entry.count++;
  next();
};

const resetLoginAttempts = (req) => {
  const key = getKey(req);
  attempts.delete(key);
};

module.exports = { loginRateLimiter, resetLoginAttempts };
