// src/routes/equipamentos.js

const express = require('express');
const Joi = require('joi');
const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const authMw = require('../middlewares/auth');
const {
  createEquipamento,
  listEquipamentos,
  getEquipamentoById,
  updateEquipamento,
  deleteEquipamento,
  importEquipamentosFromExcel
} = require('../services/equipamentosService');

const router = express.Router();
router.use(authMw);

// definição do schema de validação
const schema = Joi.object({
  tipo:                   Joi.string().max(255).required(),
  marca:                  Joi.string().max(255).required(),
  modelo:                 Joi.string().max(255).required(),
  numero_serie:           Joi.string().max(100).required(),
  data_ultima_calibracao: Joi.date().required(),
  numero_certificado:     Joi.string().max(100).required(),
  data_vencimento:        Joi.date().required()
});

// GET /api/v1/equipamentos
router.get('/', async (req, res, next) => {
  try {
    const items = await listEquipamentos();
    return success(res, items, 'Equipamentos listados.');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/equipamentos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getEquipamentoById(+req.params.id);
    return success(res, item, 'Equipamento carregado.');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/equipamentos
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, '')
      }));
      throw new ApiError(400, 'Falha de validação.', details);
    }
    const obj = await createEquipamento(value);
    return success(res, obj, 'Equipamento criado.');
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/equipamentos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, '')
      }));
      throw new ApiError(400, 'Falha de validação.', details);
    }
    const obj = await updateEquipamento(+req.params.id, value);
    return success(res, obj, 'Equipamento atualizado.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/equipamentos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteEquipamento(+req.params.id);
    return success(res, null, 'Equipamento removido.');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/equipamentos/import — importa via upload de Excel
const upload = multer({ storage: multer.memoryStorage() });
router.post(
  '/import',
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new ApiError(400, 'Arquivo não enviado.');
      const summary = await importEquipamentosFromExcel(req.file.buffer);
      return success(res, summary, 'Importação concluída.');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;