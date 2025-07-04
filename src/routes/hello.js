/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Retorna uma mensagem de saudação
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Saudação de boas-vindas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
const express = require('express');
const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Olá do EngLabor API!' });
});

module.exports = router;
