// src/services/equipamentosService.js

const pool = require('../db');
const ApiError = require('../utils/ApiError');
const xlsx = require('xlsx');

/**
 * Insere um equipamento
 */
async function createEquipamento({
  tipo,
  marca,
  modelo,
  numero_serie,
  data_ultima_calibracao,
  numero_certificado,
  data_vencimento
}) {
  const text = `
    INSERT INTO public.equipamentos
      (tipo, marca, modelo, numero_serie,
       data_ultima_calibracao, numero_certificado, data_vencimento)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`;
  const values = [
    tipo,
    marca,
    modelo,
    numero_serie,
    data_ultima_calibracao,
    numero_certificado,
    data_vencimento
  ];
  const res = await pool.query(text, values);
  return res.rows[0];
}

/**
 * Lista todos os equipamentos
 */
async function listEquipamentos() {
  const res = await pool.query(
    `SELECT * FROM public.equipamentos ORDER BY id`
  );
  return res.rows;
}

/**
 * Busca equipamento por ID
 */
async function getEquipamentoById(id) {
  const res = await pool.query(
    `SELECT * FROM public.equipamentos WHERE id = $1`, [id]
  );
  if (res.rowCount === 0) {
    throw new ApiError(404, 'Equipamento não encontrado.');
  }
  return res.rows[0];
}

/**
 * Atualiza um equipamento
 */
async function updateEquipamento(id, {
  tipo,
  marca,
  modelo,
  numero_serie,
  data_ultima_calibracao,
  numero_certificado,
  data_vencimento
}) {
  const text = `
    UPDATE public.equipamentos SET
      tipo                   = $1,
      marca                  = $2,
      modelo                 = $3,
      numero_serie           = $4,
      data_ultima_calibracao = $5,
      numero_certificado     = $6,
      data_vencimento        = $7,
      updated_at             = NOW()
    WHERE id = $8
    RETURNING *`;
  const values = [
    tipo,
    marca,
    modelo,
    numero_serie,
    data_ultima_calibracao,
    numero_certificado,
    data_vencimento,
    id
  ];
  const res = await pool.query(text, values);
  if (res.rowCount === 0) {
    throw new ApiError(404, 'Equipamento não encontrado.');
  }
  return res.rows[0];
}

/**
 * Remove um equipamento
 */
async function deleteEquipamento(id) {
  const res = await pool.query(
    `DELETE FROM public.equipamentos WHERE id = $1`, [id]
  );
  if (res.rowCount === 0) {
    throw new ApiError(404, 'Equipamento não encontrado.');
  }
  return true;
}

/**
 * Importa equipamentos de um buffer Excel
 */
async function importEquipamentosFromExcel(buffer) {
  // 1) Lê o buffer, instrui o xlsx a parsear datas como Date
  const wb    = xlsx.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  // 2) Converte pra JSON, pula as 5 primeiras linhas (header) e pega texto formatado
  const raw   = xlsx.utils.sheet_to_json(sheet, {
    range: 5,
    defval: '',
    raw: false
  });

  // helper para garantir YYYY-MM-DD ou null
  function parseDate(v) {
    if (!v) return null;
    if (v instanceof Date) {
      return v.toISOString().split('T')[0];
    }
    const d = new Date(v);
    if (isNaN(d)) {
      throw new Error(`Data inválida: "${v}"`);
    }
    return d.toISOString().split('T')[0];
  }

  // 3) Mapeia colunas exatamente como na sua planilha
  const rows = raw.map((r, idx) => ({
    tipo:                   String(r['Tipo']                                 || '').trim(),
    marca:                  String(r['Marca']                                || '').trim(),
    modelo:                 String(r['Equipamentos/Modelos']                 || '').trim(),
    numero_serie:           String(r['Nº Série']                             || '').trim(),
    data_ultima_calibracao: parseDate(r['Data da Última Calibração']),
    numero_certificado:     String(r['Número do Certificado']                || '').trim(),
    data_vencimento:        parseDate(r['Data de Vencimento'])
  }));

  const summary = { inserted: 0, updated: 0, errors: [] };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.tipo || !row.marca || !row.modelo) {
          throw new Error('Campos "Tipo", "Marca" e "Modelo" são obrigatórios');
        }
        await createEquipamento(row);
        summary.inserted++;
      } catch (e) {
        summary.errors.push({
          row:     i + 6,   // ajusta número de linha no Excel
          message: e.message
        });
      }
    }
    await client.query('COMMIT');
    return summary;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  createEquipamento,
  listEquipamentos,
  getEquipamentoById,
  updateEquipamento,
  deleteEquipamento,
  importEquipamentosFromExcel
};