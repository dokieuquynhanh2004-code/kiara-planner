module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Email da duoc su dung' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Token khong hop le' });
  }

  const status = err.status || 500;
  const message = err.message || 'Da xay ra loi phia may chu';
  res.status(status).json({ error: message });
};
