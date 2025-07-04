const pool = require('../db');
const ApiError = require('../utils/ApiError');

async function createFuncionario({ empresa_id, setor, ghe, cargo, matricula, nome }) {
  const text = `
    INSERT INTO funcionarios
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
       FROM funcionarios
       ORDER BY nome`
  );
  return res.rows;
}

async function getFuncionarioById(id) {
  const res = await pool.query(
    `SELECT id, empresa_id, setor, ghe, cargo, matricula, nome
       FROM funcionarios WHERE id = $1`,
    [id]
  );
  if (res.rowCount === 0) throw new ApiError(404, 'Funcionário não encontrado.');
  return res.rows[0];
}

async function updateFuncionario(id, { empresa_id, setor, ghe, cargo, matricula, nome }) {
  const text = `
    UPDATE funcionarios SET
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
  const res = await pool.query(`DELETE FROM funcionarios WHERE id = $1`, [id]);
  if (res.rowCount === 0) throw new ApiError(404, 'Funcionário não encontrado.');
  return true;
}

/**
 * Retorna todos os funcionários de uma dada empresa
 * @param {number} empresaId
 * @returns {Promise<Array>}
 */
async function listFuncionariosByEmpresa(empresaId) {
    const res = await pool.query(
      `SELECT id, empresa_id, setor, ghe, cargo, matricula, nome
         FROM funcionarios
        WHERE empresa_id = $1
        ORDER BY nome`,
      [empresaId]
    );
    return res.rows;
  }

module.exports = {
  createFuncionario,
  listFuncionarios,
  getFuncionarioById,
  updateFuncionario,
  deleteFuncionario,
  listFuncionariosByEmpresa,
};