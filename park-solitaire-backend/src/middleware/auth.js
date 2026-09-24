import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Missing Authorization header',
      hint: 'In Postman, go to Authorization tab -> Type: Bearer Token, or Headers tab -> Authorization: Bearer <token>'
    });
  }

  // Clean accidental double "Bearer " or case differences
  let token = authHeader.trim();
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }

  // Strip accidental quotes
  token = token.replace(/^["']|["']$/g, '').trim();

  if (!token) {
    return res.status(401).json({ message: 'Token is empty. Please run Login to obtain a token.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: err.message,
      hint: 'Your token may have expired or was copied incorrectly. Run POST /api/auth/login to get a fresh token.'
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    next();
  };
}
