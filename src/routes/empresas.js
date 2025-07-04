const express = require('express');
const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const authMiddleware = require('../middlewares/auth');
const {
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  listEmpresas,
} = require('../services/empresasService');

const router = express.Router();

// Schemas de validação
const createSchema = Joi.object({
  nome: Joi.string().max(255).required(),
  cnpj: Joi.string().max(18).required(),
});

const updateSchema = Joi.object({
  nome: Joi.string().max(255).required(),
  cnpj: Joi.string().max(18).required(),
});

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/empresas:
 *   post:
 *     tags: [Empresas]
 *     summary: Cria uma nova empresa
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cnpj:
 *                 type: string
 *             required: [nome, cnpj]
 *     responses:
 *       200:
 *         description: Empresa criada
 *       400:
 *         description: Dados inválidos
 */
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);

    const empresa = await createEmpresa(value);
    return success(res, empresa, 'Empresa criada com sucesso.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/empresas/{id}:
 *   put:
 *     tags: [Empresas]
 *     summary: Atualiza uma empresa existente
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cnpj:
 *                 type: string
 *             required: [nome, cnpj]
 *     responses:
 *       200:
 *         description: Empresa atualizada
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Empresa não encontrada
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);

    const empresa = await updateEmpresa(+req.params.id, value);
    return success(res, empresa, 'Empresa atualizada com sucesso.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/empresas/{id}:
 *   delete:
 *     tags: [Empresas]
 *     summary: Remove uma empresa
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa removida
 *       404:
 *         description: Empresa não encontrada
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteEmpresa(+req.params.id);
    return success(res, null, 'Empresa removida com sucesso.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/empresas:
 *   get:
 *     tags: [Empresas]
 *     summary: Lista todas as empresas
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Empresa'
 *                 message:
 *                   type: string
 */
router.get('/', async (req, res, next) => {
    try {
      const empresas = await listEmpresas();
      return success(res, empresas, 'Empresas listadas com sucesso.');
    } catch (err) {
      next(err);
    }
  });

module.exports = router;