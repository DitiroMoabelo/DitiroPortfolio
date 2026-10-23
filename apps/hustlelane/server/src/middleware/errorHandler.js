export function errorHandler(err, req, res, next) {
  // CORS rejection from cors package
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Already exists' });
  }

  const status = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd || status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message: status >= 500 && isProd ? 'Server error' : err.message || 'Server error',
  });
}
