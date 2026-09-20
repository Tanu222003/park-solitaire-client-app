export function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'Open GET /api to see the list of available endpoints.'
  });
}

export function errorHandler(err, req, res, _next) {
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  const status = err.status || 500;
  const payload = { message: err.message || 'Something went wrong on the server' };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack.split('\n').slice(0, 5);
  }

  res.status(status).json(payload);
}
