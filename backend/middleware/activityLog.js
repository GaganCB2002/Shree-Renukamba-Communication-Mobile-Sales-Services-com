const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, resourceType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        ActivityLog.create({
          userId: req.user._id,
          userName: req.user.fullName,
          userEmail: req.user.email,
          userRole: req.user.role,
          action,
          resourceType,
          resourceId: req.params.id || body?._id || body?.id || null,
          details: {
            method: req.method,
            path: req.originalUrl,
            body: sanitizeBody(req.body),
          },
          ipAddress: req.ip,
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};

function sanitizeBody(body) {
  if (!body) return {};
  const safe = { ...body };
  delete safe.password;
  delete safe.token;
  delete safe.otp;
  return safe;
}

module.exports = { logActivity };
