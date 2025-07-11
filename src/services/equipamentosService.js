const pool = require('../db');
const ApiError = require('../utils/ApiError');

async function createEquipamento({
  tipo, marca, modelo,
  numero_serie,
  data_ultima_calibracao,
  numero_certificado,
  data_vencimento
}) {
  const text = `
    INSERT INTO equipamentos
      (tipo, marca, modelo, numero_serie,
       data_ultima_calibracao, numero_certificado, data_vencimento)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`;
  const values = [
    tipo, marca, modelo, numero_serie,
    data_ultima_calibracao, numero_certificado, data_vencimento
  ];
  const res = await pool.query(text, values);
  return res.rows[0];
}

async function listEquipamentos() {
  const res = await pool.query(
    `SELECT * 
       FROM equipamentos
      ORDER BY id`
  );
  return res.rows;
}

async function getEquipamentoById(id) {
  const res = await pool.query(
    `SELECT * FROM equipamentos WHERE id = $1`, [id]
  );
  if (res.rowCount === 0) throw new ApiError(404, 'Equipamento não encontrado.');
  return res.rows[0];
}

async function updateEquipamento(id, {
  tipo, marca, modelo,
  numero_serie,
  data_ultima_calibracao,
  numero_certificado,
  data_vencimento
}) {
  const text = `
    UPDATE equipamentos SET
      tipo                    = $1,
      marca                   = $2,
      modelo                  = $3,
      numero_serie            = $4,
      data_ultima_calibracao  = $5,
      numero_certificado      = $6,
      data_vencimento         = $7,
      updated_at              = NOW()
    WHERE id = $8
    RETURNING *`;
  const values = [
    tipo, marca, modelo, numero_serie,
    data_ultima_calibracao, numero_certificado, data_vencimento,
    id
  ];
  const res = await pool.query(text, values);
  if (res.rowCount === 0) throw new ApiError(404, 'Equipamento não encontrado.');
  return res.rows[0];
}

async function deleteEquipamento(id) {
  const res = await pool.query(
    `DELETE FROM equipamentos WHERE id = $1`, [id]
  );
  if (res.rowCount === 0) throw new ApiError(404, 'Equipamento não encontrado.');
  return true;
}

module.exports = {
  createEquipamento,
  listEquipamentos,
  getEquipamentoById,
  updateEquipamento,
  deleteEquipamento
};