const pool = require('../db');
const ApiError = require('../utils/ApiError');

async function createEmpresa({ nome, cnpj }) {
  const text = `
    INSERT INTO empresas (nome, cnpj)
    VALUES ($1, $2)
    RETURNING id, nome, cnpj
  `;
  const values = [nome, cnpj];
  const res = await pool.query(text, values);
  return res.rows[0];
}

async function updateEmpresa(id, { nome, cnpj }) {
  const text = `
    UPDATE empresas
    SET nome = $1,
        cnpj = $2
    WHERE id = $3
    RETURNING id, nome, cnpj
  `;
  const res = await pool.query(text, [nome, cnpj, id]);
  if (res.rowCount === 0) {
    throw new ApiError(404, 'Empresa não encontrada.');
  }
  return res.rows[0];
}

async function deleteEmpresa(id) {
    await pool.query(
      `DELETE FROM funcionarios WHERE empresa_id = $1`,
      [id]
    );
    const res = await pool.query(
      `DELETE FROM empresas WHERE id = $1`,
      [id]
    );
    if (res.rowCount === 0) {
      throw new ApiError(404, 'Empresa não encontrada.');
    }
    return true;
  }

/**
 * Retorna todas as empresas
 * @returns {Promise<Array<{id:number, nome:string, cnpj:string}>>}
 */
async function listEmpresas() {
    const res = await pool.query(
      `SELECT id, nome, cnpj
         FROM empresas
         ORDER BY nome`
    );
    return res.rows;
  }

module.exports = {
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  listEmpresas, 
};