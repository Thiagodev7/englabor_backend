const express    = require('express');
const Joi        = require('joi');
const ApiError   = require('../utils/ApiError');
const { success }= require('../utils/response');
const authMw     = require('../middlewares/auth');
const {
  createEquipamento,
  listEquipamentos,
  getEquipamentoById,
  updateEquipamento,
  deleteEquipamento
} = require('../services/equipamentosService');

const router = express.Router();

// Joi schema
const schema = Joi.object({
  tipo:                   Joi.string().max(255).required(),
  marca:                  Joi.string().max(255).required(),
  modelo:                 Joi.string().max(255).required(),
  numero_serie:           Joi.string().max(100).required(),
  data_ultima_calibracao: Joi.date().required(),
  numero_certificado:     Joi.string().max(100).required(),
  data_vencimento:        Joi.date().required()
});

// todas as rotas exigem token
router.use(authMw);

/**
 * GET /api/v1/equipamentos
 */
router.get('/', async (req, res, next) => {
  try {
    const items = await listEquipamentos();
    return success(res, items, 'Equipamentos listados.');
  } catch (err) { next(err); }
});

/**
 * GET /api/v1/equipamentos/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getEquipamentoById(+req.params.id);
    return success(res, item, 'Equipamento carregado.');
  } catch (err) { next(err); }
});

/**
 * POST /api/v1/equipamentos
 */
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);
    const obj = await createEquipamento(value);
    return success(res, obj, 'Equipamento criado.');
  } catch (err) { next(err); }
});

/**
 * PUT /api/v1/equipamentos/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);
    const obj = await updateEquipamento(+req.params.id, value);
    return success(res, obj, 'Equipamento atualizado.');
  } catch (err) { next(err); }
});

/**
 * DELETE /api/v1/equipamentos/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteEquipamento(+req.params.id);
    return success(res, null, 'Equipamento removido.');
  } catch (err) { next(err); }
});

module.exports = router;