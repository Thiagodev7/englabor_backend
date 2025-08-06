// src/routes/relatorio.js

const express = require('express');
const { getRelatorioByMatricula } = require('../services/relatorioService');
const router = express.Router();

router.get('/relatorio', async (req, res, next) => {
  try {
    const matricula = req.query.matricula;
    if (!matricula) {
      return res.status(400).send('<h1>400 Bad Request</h1><p>Parâmetro "matricula" é obrigatório.</p>');
    }

    const r = await getRelatorioByMatricula(matricula);

    // gera um HTML simples
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Relatório de Medição</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Relatório para Matrícula: ${r.funcionario.matricula}</h1>

        <h2>Empresa</h2>
        <table>
          <tr><th>ID</th><td>${r.empresa.id}</td></tr>
          <tr><th>Nome</th><td>${r.empresa.nome}</td></tr>
          <tr><th>CNPJ</th><td>${r.empresa.cnpj}</td></tr>
        </table>

        <h2>Funcionário</h2>
        <table>
          <tr><th>ID</th><td>${r.funcionario.id}</td></tr>
          <tr><th>Nome</th><td>${r.funcionario.nome}</td></tr>
          <tr><th>Setor</th><td>${r.funcionario.setor}</td></tr>
          <tr><th>GHE</th><td>${r.funcionario.ghe}</td></tr>
          <tr><th>Cargo</th><td>${r.funcionario.cargo}</td></tr>
        </table>

        <h2>Medição</h2>
        <table>
          <tr><th>ID</th><td>${r.medicao.id}</td></tr>
          <tr><th>Status</th><td>${r.medicao.status}</td></tr>
          <tr><th>Data</th><td>${r.medicao.data_medicao?.toISOString().split('T')[0] ?? ''}</td></tr>
          <tr><th>Hora Início</th><td>${r.medicao.hora_inicio}</td></tr>
          <tr><th>Hora Fim</th><td>${r.medicao.hora_fim}</td></tr>
          <tr><th>Tempo Mostragem</th><td>${r.medicao.tempo_mostragem}</td></tr>
          <tr><th>Tempo Pausa</th><td>${r.medicao.tempo_pausa}</td></tr>
          <tr><th>Jornada Trabalho</th><td>${r.medicao.jornada_trabalho}</td></tr>
          <tr><th>NEN Q5 (dB(A))</th><td>${r.medicao.nen_q5}</td></tr>
          <tr><th>LAVG Q5 (dB(A))</th><td>${r.medicao.lavg_q5}</td></tr>
          <tr><th>NEN Q3 (dB(A))</th><td>${r.medicao.nen_q3}</td></tr>
          <tr><th>LAVG Q3 (dB(A))</th><td>${r.medicao.lavg_q3}</td></tr>
          <tr><th>Calibração Inicial (dB(A))</th><td>${r.medicao.calib_inicial}</td></tr>
          <tr><th>Calibração Final (dB(A))</th><td>${r.medicao.calib_final}</td></tr>
        </table>

        <h2>Equipamento</h2>
        <table>
          <tr><th>ID</th><td>${r.equipamento.id}</td></tr>
          <tr><th>Tipo</th><td>${r.equipamento.tipo}</td></tr>
          <tr><th>Marca</th><td>${r.equipamento.marca}</td></tr>
          <tr><th>Modelo</th><td>${r.equipamento.modelo}</td></tr>
          <tr><th>Número Série</th><td>${r.equipamento.numero_serie}</td></tr>
        </table>

        <h2>Avaliador</h2>
        <table>
          <tr><th>ID</th><td>${r.avaliador.avaliador_id}</td></tr>
          <tr><th>Nome</th><td>${r.avaliador.avaliador_nome}</td></tr>
          <tr><th>Email</th><td>${r.avaliador.avaliador_email}</td></tr>
        </table>
      </body>
      </html>
    `);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(`<h1>${err.status}</h1><p>${err.message}</p>`);
    } else {
      next(err);
    }
  }
});

module.exports = router;