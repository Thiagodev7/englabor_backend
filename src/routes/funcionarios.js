const express = require('express');
const Joi = require('joi');
const multer       = require('multer');       // ← adicione isto
const xlsx         = require('xlsx'); 
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
  importByEmpresa,
} = require('../services/funcionariosService');

const router = express.Router();

// validação Joi
const schema = Joi.object({
  empresa_id: Joi.number().integer().allow(null),
  setor:      Joi.string().max(100).allow('', null),
  ghe:        Joi.string().max(100).allow('', null),
  cargo:      Joi.string().max(100).allow('', null),
  matricula:  Joi.string().max(50).allow('', null),
  nome:       Joi.string().max(255).allow('', null)
});

// todas as rotas precisam de token
router.use(authMiddleware);

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/v1/funcionarios:
 *   get:
 *     tags: [Funcionários]
 *     summary: Lista todos os funcionários
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de funcionários
 */
router.get('/', async (req, res, next) => {
  try {
    const items = await listFuncionarios();
    return success(res, items, 'Funcionários listados.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/funcionarios/{id}:
 *   get:
 *     tags: [Funcionários]
 *     summary: Busca um funcionário por ID
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Funcionário encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getFuncionarioById(+req.params.id);
    return success(res, item, 'Funcionário carregado.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/funcionarios:
 *   post:
 *     tags: [Funcionários]
 *     summary: Cria um novo funcionário
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/Funcionario' } } }
 *     responses:
 *       200:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);
    const obj = await createFuncionario(value);
    return success(res, obj, 'Funcionário criado.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/funcionarios/{id}:
 *   put:
 *     tags: [Funcionários]
 *     summary: Atualiza um funcionário
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/Funcionario' } } }
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, 'Dados inválidos.', error.details);
    const obj = await updateFuncionario(+req.params.id, value);
    return success(res, obj, 'Funcionário atualizado.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/funcionarios/{id}:
 *   delete:
 *     tags: [Funcionários]
 *     summary: Remove um funcionário
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Removido com sucesso
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteFuncionario(+req.params.id);
    return success(res, null, 'Funcionário removido.');
  } catch (err) {
    next(err);
  }
});


/**
 * @swagger
 * /api/v1/funcionarios/empresa/{empresa_id}:
 *   get:
 *     tags: [Funcionários]
 *     summary: Lista funcionários de uma empresa
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Funcionários listados por empresa
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
 *                     $ref: '#/components/schemas/Funcionario'
 *                 message:
 *                   type: string
 */
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


/**
 * @swagger
 * /api/v1/funcionarios/import/{empresa_id}:
 *   post:
 *     tags: [Funcionários]
 *     summary: Importa lista de funcionários de um arquivo Excel
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da empresa à qual todos os funcionários pertencem
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Importação concluída
 *       400:
 *         description: Falha na validação ou arquivo não enviado
 */

router.post(
  '/import/:empresa_id',
  authMiddleware,
  upload.single('file'),
  async (req, res, next) => {
    try {
      const empresaId = +req.params.empresa_id;
      if (isNaN(empresaId)) throw new ApiError(400, 'empresa_id inválido.');
      if (!req.file)   throw new ApiError(400, 'Arquivo não enviado.');

      const summary = await importByEmpresa(empresaId, req.file.buffer);
      return success(res, summary, 'Importação concluída.');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;