const express = require('express');
const Joi = require('joi');
const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const authMiddleware = require('../middlewares/auth');
const {
  createFuncionario,
  listFuncionarios,
  getFuncionarioById,
  updateFuncionario,
  deleteFuncionario,
  listFuncionariosByEmpresa,
  importByEmpresa
} = require('../services/funcionariosService');

const router = express.Router();
router.use(authMiddleware);

// validação Joi — todos os campos opcionais
const schema = Joi.object({
  empresa_id: Joi.number().integer().optional().allow(null),
  setor:      Joi.string().max(100).optional().allow('', null),
  ghe:        Joi.string().max(100).optional().allow('', null),
  cargo:      Joi.string().max(100).optional().allow('', null),
  matricula:  Joi.string().max(50).optional().allow('', null),
  nome:       Joi.string().max(255).optional().allow('', null)
});

// rotas específicas para empresa devem vir ANTES da rota por :id
router.get('/empresa/:empresa_id', async (req, res, next) => {
  try {
    const empresaId = +req.params.empresa_id;
    if (isNaN(empresaId)) throw new ApiError(400, 'empresa_id inválido.');
    const items = await listFuncionariosByEmpresa(empresaId);
    return success(res, items, 'Funcionários filtrados por empresa.');
  } catch (err) {
    next(err);
  }
});

// lista geral
router.get('/', async (req, res, next) => {
  try {
    const items = await listFuncionarios();
    return success(res, items, 'Funcionários listados.');
  } catch (err) {
    next(err);
  }
});

// busca por ID
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getFuncionarioById(+req.params.id);
    return success(res, item, 'Funcionário carregado.');
  } catch (err) {
    next(err);
  }
});

// cria
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/[\"]/g, '')
      }));
      throw new ApiError(400, 'Falha de validação.', details);
    }
    const obj = await createFuncionario(value);
    return success(res, obj, 'Funcionário criado.');
  } catch (err) {
    next(err);
  }
});

// atualiza
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/[\"]/g, '')
      }));
      throw new ApiError(400, 'Falha de validação.', details);
    }
    const obj = await updateFuncionario(+req.params.id, value);
    return success(res, obj, 'Funcionário atualizado.');
  } catch (err) {
    next(err);
  }
});

// deleta
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteFuncionario(+req.params.id);
    return success(res, null, 'Funcionário removido.');
  } catch (err) {
    next(err);
  }
});

// importação de Excel
const upload = multer({ storage: multer.memoryStorage() });
router.post(
  '/import/:empresa_id',
  upload.single('file'),
  async (req, res, next) => {
    try {
      const empresaId = +req.params.empresa_id;
      if (isNaN(empresaId)) throw new ApiError(400, 'empresa_id inválido.');
      if (!req.file) throw new ApiError(400, 'Arquivo não enviado.');

      const summary = await importByEmpresa(empresaId, req.file.buffer);
      return success(res, summary, 'Importação concluída.');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
