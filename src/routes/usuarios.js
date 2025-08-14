const express = require('express');
const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const {
  createUser,
  updateUser,
  changePassword,
  listUsers,
  findById,
  resetPassword,
  deleteUser
} = require('../services/usuariosService');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// --- Schemas Joi ---

// Create
const createSchema = Joi.object({
  nome:      Joi.string().max(100).required(),
  cpf:       Joi.string().max(14).required(),
  email:     Joi.string().email().max(100).required(),
  telefone:  Joi.string().max(20).allow('', null),
  password:  Joi.string().min(6).required(),
  role:      Joi.string().valid('user','admin').default('user'),
});

// Update (no password)
const updateSchema = Joi.object({
  nome:      Joi.string().max(100).required(),
  cpf:       Joi.string().max(14).required(),
  email:     Joi.string().email().max(100).required(),
  telefone:  Joi.string().max(20).allow('', null),
  role:      Joi.string().valid('user','admin').required(),
});

// Change password
const passwordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// List (querystring)
const listQuerySchema = Joi.object({
  page:    Joi.number().integer().min(1).default(1),
  limit:   Joi.number().integer().min(1).max(100).default(20),
  q:       Joi.string().allow('', null),
  role:    Joi.string().valid('user','admin').optional(),
  sortBy:  Joi.string().valid('id','nome','cpf','email','telefone','role','created_at','updated_at').default('created_at'),
  sortDir: Joi.string().valid('asc','desc','ASC','DESC').default('desc')
});

// NOVO: reset de senha (opcionalmente aceita newPassword; padrão 123mudar)
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).default('123mudar'),
});

// --- Public routes ---

// Create user (signup)
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);
    const user = await createUser(value);
    return success(res, user, 'Usuário criado com sucesso.');
  } catch (err) {
    next(err);
  }
});

// NOVO: Reset de senha — padrão 123mudar (não requer senha antiga)
router.put('/:id/reset-password', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, 'ID inválido.');
    const { value } = resetPasswordSchema.validate(req.body || {}); // aceita vazio
    await resetPassword(id, value.newPassword);
    return success(res, null, 'Senha resetada com sucesso para o padrão.');
  } catch (err) {
    next(err);
  }
});

// All routes below require API token
router.use(authMiddleware);

// List users
router.get('/', async (req, res, next) => {
  try {
    const { error, value } = listQuerySchema.validate(req.query);
    if (error) throw new ApiError(400, 'Parâmetros de lista inválidos.', error.details);
    const data = await listUsers(value);
    return success(res, data, 'Lista de usuários carregada.');
  } catch (err) {
    next(err);
  }
});

// Get a single user by id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, 'ID inválido.');
    const user = await findById(id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');
    // Don't expose password
    delete user.password;
    return success(res, user, 'Usuário encontrado.');
  } catch (err) {
    next(err);
  }
});

// Update user
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);
    const updated = await updateUser(+req.params.id, value);
    if (!updated) throw new ApiError(404, 'Usuário não encontrado.');
    return success(res, updated, 'Usuário atualizado com sucesso.');
  } catch (err) {
    next(err);
  }
});

// Change password
router.put('/:id/password', async (req, res, next) => {
  try {
    const { error, value } = passwordSchema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);
    const ok = await changePassword(+req.params.id, value.oldPassword, value.newPassword);
    if (ok === null) throw new ApiError(400, 'Senha antiga incorreta.');
    return success(res, null, 'Senha alterada com sucesso.');
  } catch (err) {
    next(err);
  }
});

// Delete user (hard delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, 'ID inválido.');
    const ok = await deleteUser(id);
    if (!ok) throw new ApiError(404, 'Usuário não encontrado.');
    return success(res, null, 'Usuário removido com sucesso.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;