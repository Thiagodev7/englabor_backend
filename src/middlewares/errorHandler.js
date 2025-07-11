// src/middlewares/errorHandler.js

const ApiError = require('../utils/ApiError');

module.exports = (err, req, res, next) => {
  // Se for nossa classe de erro
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({
        success: false,
        message: err.message,
        ...(err.details != null ? { errors: err.details } : {})
      });
  }

  // Erro inesperado
  console.error(err);
  return res
    .status(500)
    .json({
      success: false,
      message: 'Erro interno no servidor. Tente novamente mais tarde.'
    });
};