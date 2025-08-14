// src/routes/relatorio.js
const express = require('express');
const puppeteer = require('puppeteer');
const { getRelatorioByMatricula } = require('../services/relatorioService');

const router = express.Router();

/** ---------- Helpers compartilhados ---------- */
function fmtDate(d) {
  if (!d) return '';
  try {
    const date = (d instanceof Date) ? d : new Date(d);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return String(d).slice(0, 10);
  }
}
const safe = (v) => (v ?? '').toString();

function resolveFotoSrc(r) {
  // sua foto veio no objeto de medição (como você mostrou):
  if (r?.medicao?.foto_url) return r.medicao.foto_url;
  if (r?.medicao?.foto_base64) return `data:image/jpeg;base64,${r.medicao.foto_base64}`;

  // fallback: avatar com o nome do funcionário
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    r?.funcionario?.nome || 'Funcionario'
  )}&background=random&bold=true`;
  return avatar;
}

/** HTML único para página e PDF */
function buildReportHTML(r) {
  const fotoSrc = resolveFotoSrc(r);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório de Medição — Matrícula ${safe(r.funcionario.matricula)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #f7f8fa;
      --card: #ffffff;
      --muted: #5f6b7a;
      --text: #1f2937;
      --primary: #0f766e;
      --border: #e5e7eb;
      --chip-bg: #ecfeff;
      --chip-text: #155e75;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"; }
    .container { max-width: 1000px; margin: 32px auto; padding: 0 20px; }
    .header { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center; margin-bottom: 20px; }
    .title { margin: 0; font-size: 24px; }
    .subtitle { margin: 4px 0 0; color: var(--muted); font-size: 14px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03); padding: 16px; margin-bottom: 16px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .section-title { margin: 0 0 12px; font-size: 18px; }
    .kv { display: grid; grid-template-columns: 220px 1fr; row-gap: 8px; column-gap: 12px; font-size: 14px; }
    .kv label { color: var(--muted); }
    .chip { display: inline-block; padding: 4px 10px; border-radius: 999px; background: var(--chip-bg);
      color: var(--chip-text); font-size: 12px; font-weight: 600; }
    .photo { width: 120px; height: 120px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border);
      background: #fff; display: flex; align-items: center; justify-content: center; }
    .photo img { width: 100%; height: 100%; object-fit: cover; }
    .muted { color: var(--muted); }
    .footer { margin-top: 24px; color: var(--muted); font-size: 12px; text-align: center; }
    @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } .kv { grid-template-columns: 1fr; } .photo { width: 96px; height: 96px; } }
    @media print { body { background: #fff; } .card { box-shadow: none; } .container { margin: 0; } .no-print { display: none !important; } }
    /* Tabelas base (caso precise) */
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
    th { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">Relatório de Medição</h1>
        <p class="subtitle">Matrícula <strong>${safe(r.funcionario.matricula)}</strong></p>
      </div>
      <!-- Botão abre a rota PDF em nova aba -->
      <a class="no-print" href="/relatorio/pdf?matricula=${encodeURIComponent(safe(r.funcionario.matricula))}"
         style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:#fff;cursor:pointer;text-decoration:none;color:#111;">
        Imprimir (PDF)
      </a>
    </div>

    <!-- Empresa & Funcionário -->
    <div class="grid-2">
      <section class="card">
        <h2 class="section-title">Empresa</h2>
        <div class="kv">
          <label>ID</label><div>${safe(r.empresa.id)}</div>
          <label>Nome</label><div>${safe(r.empresa.nome)}</div>
          <label>CNPJ</label><div>${safe(r.empresa.cnpj)}</div>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">Funcionário</h2>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;">
          <div class="photo"><img src="${fotoSrc}" alt="Foto do funcionário" /></div>
          <div class="kv" style="grid-template-columns:140px 1fr;">
            <label>ID</label><div>${safe(r.funcionario.id)}</div>
            <label>Nome</label><div>${safe(r.funcionario.nome)}</div>
            <label>Setor</label><div>${safe(r.funcionario.setor)}</div>
            <label>GHE</label><div>${safe(r.funcionario.ghe)}</div>
            <label>Cargo</label><div>${safe(r.funcionario.cargo)}</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Medição -->
    <section class="card">
      <h2 class="section-title">Medição</h2>
      <div class="kv">
        <label>ID</label><div>${safe(r.medicao.id)}</div>
        <label>Status</label><div><span class="chip">${safe(r.medicao.status)}</span></div>
        <label>Data</label><div>${fmtDate(r.medicao.data_medicao)}</div>
        <label>Hora Início</label><div>${safe(r.medicao.hora_inicio)}</div>
        <label>Hora Fim</label><div>${safe(r.medicao.hora_fim)}</div>
        <label>Tempo de Mostragem</label><div>${safe(r.medicao.tempo_mostragem)}</div>
        <label>Tempo de Pausa</label><div>${safe(r.medicao.tempo_pausa)}</div>
        <label>Jornada de Trabalho</label><div>${safe(r.medicao.jornada_trabalho)}</div>
        <label>NEN Q5 (dB(A))</label><div>${safe(r.medicao.nen_q5)}</div>
        <label>LAVG Q5 (dB(A))</label><div>${safe(r.medicao.lavg_q5)}</div>
        <label>NEN Q3 (dB(A))</label><div>${safe(r.medicao.nen_q3)}</div>
        <label>LAVG Q3 (dB(A))</label><div>${safe(r.medicao.lavg_q3)}</div>
        <label>Calibração Inicial (dB(A))</label><div>${safe(r.medicao.calibracao_inicial)}</div>
        <label>Calibração Final (dB(A))</label><div>${safe(r.medicao.calibracao_final)}</div>
      </div>
    </section>

    <!-- Equipamento & Avaliador -->
    <div class="grid-2">
      <section class="card">
        <h2 class="section-title">Equipamento</h2>
        ${
          r.equipamento
            ? `<div class="kv">
                <label>ID</label><div>${safe(r.equipamento.id)}</div>
                <label>Tipo</label><div>${safe(r.equipamento.tipo)}</div>
                <label>Marca</label><div>${safe(r.equipamento.marca)}</div>
                <label>Modelo</label><div>${safe(r.equipamento.modelo)}</div>
                <label>Número de Série</label><div>${safe(r.equipamento.numero_serie)}</div>
              </div>`
            : `<p class="muted">Sem informações do equipamento.</p>`
        }
      </section>

      <section class="card">
        <h2 class="section-title">Avaliador</h2>
        ${
          r.avaliador
            ? `<div class="kv">
                <label>ID</label><div>${safe(r.avaliador.avaliador_id)}</div>
                <label>Nome</label><div>${safe(r.avaliador.avaliador_nome)}</div>
                <label>Email</label><div>${safe(r.avaliador.avaliador_email)}</div>
              </div>`
            : `<p class="muted">Sem informações do avaliador.</p>`
        }
      </section>
    </div>

    <div class="footer">
      Gerado em ${fmtDate(new Date())} — Sistema de Relatórios
    </div>
  </div>
</body>
</html>`;
}

/** Gera PDF a partir do HTML usando Puppeteer */
async function htmlToPdf(html) {
  const browser = await puppeteer.launch({
    // Em muitos hosts (Docker/CI) é preciso desabilitar o sandbox:
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Usa as regras de impressão do CSS (@media print)
    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

/** ---------- Rotas ---------- */

// Página HTML
router.get('/relatorio', async (req, res, next) => {
  try {
    const matricula = req.query.matricula;
    if (!matricula) {
      return res.status(400).send('<h1>400 Bad Request</h1><p>Parâmetro "matricula" é obrigatório.</p>');
    }

    const r = await getRelatorioByMatricula(matricula);
    const html = buildReportHTML(r);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(`<h1>${err.status}</h1><p>${err.message}</p>`);
    } else {
      next(err);
    }
  }
});

// PDF
router.get('/relatorio/pdf', async (req, res, next) => {
  try {
    const matricula = req.query.matricula;
    if (!matricula) {
      return res.status(400).send('<h1>400 Bad Request</h1><p>Parâmetro "matricula" é obrigatório.</p>');
    }

    const r = await getRelatorioByMatricula(matricula);
    const html = buildReportHTML(r);
    const pdfBuffer = await htmlToPdf(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="relatorio-${safe(r.funcionario.matricula)}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(`<h1>${err.status}</h1><p>${err.message}</p>`);
    } else {
      next(err);
    }
  }
});

module.exports = router;