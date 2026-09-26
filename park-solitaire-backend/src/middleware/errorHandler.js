export function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'Open GET /api to see the list of available endpoints.'
  });
}

export function errorHandler(err, req, res, _next) {
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  const isDbError =
    err.code === 'ECONNREFUSED' ||
    err.code === 'ETIMEDOUT' ||
    err.code === 'ER_SERVER_SHUTDOWN' ||
    err.code === 'PROTOCOL_CONNECTION_LOST';

  const status = isDbError ? 503 : (err.status || 500);
  const payload = {
    message: isDbError
      ? 'Database service is temporarily reconnecting. Please retry in a few moments.'
      : (err.message || 'Something went wrong on the server'),
    ...(err.code ? { code: err.code } : {})
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack.split('\n').slice(0, 5);
  }

  res.status(status).json(payload);
}
