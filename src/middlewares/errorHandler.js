const { error: sendError } = require('../utils/response');
const ApiError = require('../utils/ApiError');

module.exports = (err, req, res, next) => {
  // Se for nosso ApiError, usamos o status e message dele
  if (err instanceof ApiError) {
    return sendError(res, err.status, err.message, err.details);
  }

  // Caso contrário, é um erro inesperado
  console.error(err);
  return sendError(
    res,
    500,
    'Erro interno no servidor.',
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};