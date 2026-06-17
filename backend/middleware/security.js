const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin || referer) {
    const allowedOrigins = process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://localhost:5000']
      : (process.env.FRONTEND_URL || 'https://shree-renukamba-communication-mobil.vercel.app').split(',');

    const source = origin || referer || '';
    const isAllowed = allowedOrigins.some(a => source.startsWith(a));

    if (!isAllowed) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  next();
};

module.exports = { csrfProtection };