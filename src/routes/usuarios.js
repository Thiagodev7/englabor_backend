const express = require('express');
const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const {
  createUser,
  updateUser,
  changePassword
} = require('../services/usuariosService');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// --- Schemas Joi ---

// Criação de usuário
const createSchema = Joi.object({
  nome:      Joi.string().max(100).required(),
  cpf:       Joi.string().max(14).required(),
  email:     Joi.string().email().max(100).required(),
  telefone:  Joi.string().max(20).allow('', null),
  password:  Joi.string().min(6).required(),
  role:      Joi.string().valid('user','admin').default('user'),
});

// Atualização de dados
const updateSchema = Joi.object({
  nome:      Joi.string().max(100).required(),
  cpf:       Joi.string().max(14).required(),
  email:     Joi.string().email().max(100).required(),
  telefone:  Joi.string().max(20).allow('', null),
  role:      Joi.string().valid('user','admin').required(),
});

// Troca de senha
const passwordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// --- Rotas públicas ---

// Criar usuário
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Dados inválidos.', error.details);
    }
    const user = await createUser(value);
    return success(res, user, 'Usuário criado com sucesso.');
  } catch (err) {
    next(err);
  }
});

// --- Rotas protegidas ---
router.use(authMiddleware);

// Atualizar usuário
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Dados inválidos.', error.details);
    }
    const updated = await updateUser(+req.params.id, value);
    if (!updated) {
      throw new ApiError(404, 'Usuário não encontrado.');
    }
    return success(res, updated, 'Usuário atualizado com sucesso.');
  } catch (err) {
    next(err);
  }
});

// Trocar senha
router.put('/:id/password', async (req, res, next) => {
  try {
    const { error, value } = passwordSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Dados inválidos.', error.details);
    }
    const ok = await changePassword(
      +req.params.id,
      value.oldPassword,
      value.newPassword
    );
    if (ok === null) {
      throw new ApiError(400, 'Senha antiga incorreta.');
    }
    return success(res, null, 'Senha alterada com sucesso.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;