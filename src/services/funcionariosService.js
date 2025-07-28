// src/services/funcionariosService.js

const pool = require('../db');
const ApiError = require('../utils/ApiError');

async function createFuncionario({ empresa_id, setor, ghe, cargo, matricula, nome }) {
  const text = `
    INSERT INTO public.funcionarios
      (empresa_id, setor, ghe, cargo, matricula, nome)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id, empresa_id, setor, ghe, cargo, matricula, nome
  `;
  const values = [empresa_id || null, setor || null, ghe || null, cargo || null, matricula || null, nome || null];
  const res = await pool.query(text, values);
  return res.rows[0];
}

async function listFuncionarios() {
  const res = await pool.query(
    `SELECT id, empresa_id, setor, ghe, cargo, matricula, nome
       FROM public.funcionarios
       ORDER BY nome`
  );
  return res.rows;
}

async function getFuncionarioById(id) {
  const res = await pool.query(
    `SELECT id, empresa_id, setor, ghe, cargo, matricula, nome
       FROM public.funcionarios WHERE id = $1`,
    [id]
  );
  if (res.rowCount === 0) throw new ApiError(404, 'Funcionário não encontrado.');
  return res.rows[0];
}

async function updateFuncionario(id, { empresa_id, setor, ghe, cargo, matricula, nome }) {
  const text = `
    UPDATE public.funcionarios SET
      empresa_id = $1,
      setor       = $2,
      ghe         = $3,
      cargo       = $4,
      matricula   = $5,
      nome        = $6
    WHERE id = $7
    RETURNING id, empresa_id, setor, ghe, cargo, matricula, nome
  `;
  const values = [empresa_id || null, setor || null, ghe || null, cargo || null, matricula || null, nome || null, id];
  const res = await pool.query(text, values);
  if (res.rowCount === 0) throw new ApiError(404, 'Funcionário não encontrado.');
  return res.rows[0];
}

async function deleteFuncionario(id) {
  const res = await pool.query(`DELETE FROM public.funcionarios WHERE id = $1`, [id]);
  if (res.rowCount === 0) throw new ApiError(404, 'Funcionário não encontrado.');
  return true;
}

/**
 * Retorna todos os funcionários de uma dada empresa
// src/services/funcionariosService.js

/**
 * Retorna todos os funcionários de uma dada empresa,
 * incluindo o status da medição (se existir)
 * @param {number} empresaId
 * @returns {Promise<Array>}
 */
async function listFuncionariosByEmpresa(empresaId) {
  const res = await pool.query(
    `
    SELECT 
      f.id,
      f.empresa_id,
      f.setor,
      f.ghe,
      f.cargo,
      f.matricula,
      f.nome,
      m.status AS medicao_status
    FROM public.funcionarios f
    LEFT JOIN medicao m
      ON m.funcionario_id = f.id
    WHERE f.empresa_id = $1
    ORDER BY f.nome
    `,
    [empresaId]
  );
  return res.rows;
}

/**
 * Importa funcionários de um buffer Excel
 * @param {number} empresaId
 * @param {Buffer} buffer
 */
async function importByEmpresa(empresaId, buffer) {
  const xlsx = require('xlsx');
  const wb = xlsx.read(buffer, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  const rows = rawRows.map((r) => ({
    id:        r.id ?? r.ID ?? null,
    nome:      (r.nome ?? r.Nome ?? '').toString().trim(),
    matricula: (r.matricula ?? r.Matrícula ?? '').toString().trim(),
    setor:     (r.setor ?? r.Setor ?? '').toString().trim(),
    ghe:       (r.ghe ?? r.GHE ?? '').toString().trim(),
    cargo:     (r.cargo ?? r.Cargo ?? '').toString().trim(),
  }));

  const summary = { inserted: 0, updated: 0, errors: [] };
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (let [idx, row] of rows.entries()) {
      try {
        if (!row.nome) throw new Error('Campo "nome" é obrigatório');
        const data = {
          empresa_id: empresaId,
          nome:       row.nome,
          matricula:  row.matricula,
          setor:      row.setor,
          ghe:        row.ghe,
          cargo:      row.cargo,
        };
        if (row.id) {
          await updateFuncionario(row.id, data);
          summary.updated++;
        } else {
          await createFuncionario(data);
          summary.inserted++;
        }
      } catch (err) {
        summary.errors.push({ row: idx + 2, message: err.message });
      }
    }
    await client.query('COMMIT');
    return summary;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createFuncionario,
  listFuncionarios,
  getFuncionarioById,
  updateFuncionario,
  deleteFuncionario,
  listFuncionariosByEmpresa,
  importByEmpresa,
};
