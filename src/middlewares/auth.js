const { apiToken } = require('../../config');
module.exports = (req, res, next) => {
  const token = req.header('x-api-key') || req.header('Authorization')?.replace(/^Bearer\s+/, '');
  if (!token || token !== apiToken) {
    return res.status(401).json({ message: 'Token inválido ou ausente.' });
  }
  next();
};
