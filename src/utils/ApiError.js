// src/utils/ApiError.js

class ApiError extends Error {
  /**
   * @param {number} status  Código HTTP
   * @param {string} message Mensagem amigável para o front
   * @param {any}    [details]  Dados adicionais (ex: array de erros de validação)
   */
  constructor(status, message, details = null) {
    super(message);
    this.name    = 'ApiError';
    this.status  = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;