/**
 * Funções para respostas padronizadas
 */
  
/**
 * Envia JSON de sucesso
 * @param {Response} res 
 * @param {any} data 
 * @param {string} [message] mensagem opcional
 */
function success(res, data = null, message = null) {
    const payload = { success: true };
    if (message) payload.message = message;
    if (data !== null) payload.data = data;
    return res.json(payload);
  }
  
  /**
   * Envia JSON de erro
   * @param {Response} res 
   * @param {number} status 
   * @param {string} message 
   * @param {any} [errors] detalhes opcionais
   */
  function error(res, status, message, errors = null) {
    const payload = { success: false, message };
    if (errors) payload.errors = errors;
    return res.status(status).json(payload);
  }
  
  module.exports = { success, error };