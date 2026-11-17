const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'not authenticated' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (_err) {
    return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده است' });
  }
}

function requireManager(req, res, next) {
  if (req.user.role !== 'MANAGER') {
    return res.status(403).json({ error: 'فقط مدیر به این بخش دسترسی دارد' });
  }
  next();
}

function requireOperatorOrManager(req, res, next) {
  next();
}

module.exports = { authenticate, requireManager, requireOperatorOrManager };
