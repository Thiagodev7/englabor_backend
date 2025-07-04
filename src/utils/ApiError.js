class ApiError extends Error {
    /**
     * @param {number} status HTTP status code
     * @param {string} message Mensagem para o usuário
     * @param {any} [details] Dados adicionais (validação, stack, etc.)
     */
    constructor(status, message, details = null) {
      super(message);
      this.status = status;
      this.details = details;
    }
  }
  
  module.exports = ApiError;