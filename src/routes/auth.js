const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { authenticate } = require('../services/authService');
const { apiToken } = require('../../config');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15*60*1000, max: 10 });

const schema = Joi.object({
  identifier: Joi.string().required(),
  password:   Joi.string().required(),
});

router.post('/', limiter, async (req, res, next) => {
  try {
    // 1) validação do corpo
    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);

    // 2) autentica (retorna apenas o user sem senha)
    const user = await authenticate(value.identifier, value.password);
    if (!user) throw new ApiError(401, 'Credenciais inválidas.');

    // 3) monta resposta incluindo token fixo + dados do usuário
    return success(
      res,
      { 
        token: apiToken,
        user  // { id, nome, cpf, email, telefone, role }
      },
      'Autenticado com sucesso.'
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;