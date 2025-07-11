// src/routes/medicao.js

const express = require('express');
const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const authMw = require('../middlewares/auth');
const {
  createMedicao,
  listMedicoes,
  getMedicaoById,
  updateMedicao,
  deleteMedicao,
  getMedicaoByFuncionario
} = require('../services/medicaoService');

const router = express.Router();
router.use(authMw);

// Joi validation schema for Medicao
const schema = Joi.object({
  funcionario_id:     Joi.number().integer().required(),
  equipamento_id:     Joi.number().integer().required(),
  avaliador_id:       Joi.number().integer().required(),
  status:             Joi.string().max(50).required(),
  data_medicao:       Joi.date().optional().allow(null),
  hora_inicio:        Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).optional().allow('', null),
  hora_fim:           Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).optional().allow('', null),
  tempo_mostragem:    Joi.string().optional().allow('', null),
  nen_q5:             Joi.number().optional().allow(null),
  lavg_q5:            Joi.number().optional().allow(null),
  nen_q3:             Joi.number().optional().allow(null),
  lavg_q3:            Joi.number().optional().allow(null),
  calibracao_inicial: Joi.number().optional().allow(null),
  calibracao_final:   Joi.number().optional().allow(null),
  desvio:             Joi.number().optional().allow(null),
  tempo_pausa:        Joi.string().optional().allow('', null),
  inicio_pausa:       Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).optional().allow('', null),
  final_pausa:        Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).optional().allow('', null),
  jornada_trabalho:   Joi.string().optional().allow('', null),
  observacao:         Joi.string().optional().allow('', null),
});

// GET /medicoes - lista todas medições
router.get('/', async (req, res, next) => {
  try {
    const items = await listMedicoes();
    return success(res, items, 'Medições listadas.');
  } catch (err) {
    next(err);
  }
});

// GET /medicoes/:id - busca medição por ID
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getMedicaoById(+req.params.id);
    return success(res, item, 'Medição carregada.');
  } catch (err) {
    next(err);
  }
});

// GET /medicoes/funcionario/:id - busca medição por funcionário

router.get('/funcionario/:id', async (req, res, next) => {
  try {
    const med = await getMedicaoByFuncionario(+req.params.id);
    // sempre usa success(), passando med (que pode ser null)
    return success(res, med, med ? 'Medição carregada.' : 'Nenhuma medição encontrada.');
  } catch (err) {
    next(err);
  }
});

// POST /medicoes - cria nova medição
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const details = error.details.map(d => ({
        field:   d.path.join('.'),
        message: d.message.replace(/"/g, '')
      }));
      throw new ApiError(400, 'Falha de validação.', details);
    }
    const med = await createMedicao(value);
    return success(res, med, 'Medição criada.');
  } catch (err) {
    next(err);
  }
});

// PUT /medicoes/:id - atualiza medição existente
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const details = error.details.map(d => ({
        field:   d.path.join('.'),
        message: d.message.replace(/"/g, '')
      }));
      throw new ApiError(400, 'Falha de validação.', details);
    }
    const med = await updateMedicao(+req.params.id, value);
    return success(res, med, 'Medição atualizada.');
  } catch (err) {
    next(err);
  }
});

// DELETE /medicoes/:id - remove medição
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteMedicao(+req.params.id);
    return success(res, null, 'Medição removida.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;