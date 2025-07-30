const pool     = require('../db');
const ApiError = require('../utils/ApiError');

async function listMedicoes() {
  const res = await pool.query(`
    SELECT
      id, funcionario_id, equipamento_id, avaliador_id, status,
      data_medicao, hora_inicio, hora_fim, tempo_mostragem,
      nen_q5, lavg_q5, nen_q3, lavg_q3,
      calibracao_inicial, calibracao_final, desvio,
      tempo_pausa, inicio_pausa, final_pausa,
      jornada_trabalho, observacao,
      created_at, updated_at
    FROM public.medicao
    ORDER BY data_medicao DESC
  `);
  return res.rows;
}

async function getMedicaoById(id) {
  const res = await pool.query(`
    SELECT
      id, funcionario_id, equipamento_id, avaliador_id, status,
      data_medicao, hora_inicio, hora_fim, tempo_mostragem,
      nen_q5, lavg_q5, nen_q3, lavg_q3,
      calibracao_inicial, calibracao_final, desvio,
      tempo_pausa, inicio_pausa, final_pausa,
      jornada_trabalho, observacao,
      created_at, updated_at
    FROM public.medicao
    WHERE id = $1
  `, [id]);
  if (res.rowCount === 0) throw new ApiError(404, 'Medição não encontrada.');
  return res.rows[0];
}

// ... imports
async function createMedicao({
  funcionario_id,
  equipamento_id,
  avaliador_id,
  status,
  data_medicao,
  hora_inicio,
  hora_fim,
  tempo_mostragem,
  nen_q5,
  lavg_q5,
  nen_q3,
  lavg_q3,
  calibracao_inicial,
  calibracao_final,
  hora_calibracao_inicio,   // ← novo
  hora_calibracao_fim,      // ← novo
  desvio,
  tempo_pausa,
  inicio_pausa,
  final_pausa,
  jornada_trabalho,
  observacao
}) {
  const text = `
    INSERT INTO public.medicao (
      funcionario_id, equipamento_id, avaliador_id, status,
      data_medicao, hora_inicio, hora_fim, tempo_mostragem,
      nen_q5, lavg_q5, nen_q3, lavg_q3,
      calibracao_inicial, calibracao_final,
      hora_calibracao_inicio, hora_calibracao_fim,  -- ← novos
      desvio,
      tempo_pausa, inicio_pausa, final_pausa,
      jornada_trabalho, observacao,
      created_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,
      $5,$6,$7,$8,
      $9,$10,$11,$12,
      $13,$14,
      $15,$16,           -- ← índices ajustados
      $17,
      $18,$19,$20,
      $21,$22,
      now(), now()
    )
    RETURNING *`;
  const values = [
    funcionario_id, equipamento_id, avaliador_id, status,
    data_medicao, hora_inicio, hora_fim, tempo_mostragem,
    nen_q5, lavg_q5, nen_q3, lavg_q3,
    calibracao_inicial, calibracao_final,
    hora_calibracao_inicio, hora_calibracao_fim,  // ← novos
    desvio,
    tempo_pausa, inicio_pausa, final_pausa,
    jornada_trabalho, observacao
  ];
  const res = await pool.query(text, values);
  return res.rows[0];
}

async function updateMedicao(id, {
  funcionario_id,
  equipamento_id,
  avaliador_id,
  status,
  data_medicao,
  hora_inicio,
  hora_fim,
  tempo_mostragem,
  nen_q5,
  lavg_q5,
  nen_q3,
  lavg_q3,
  calibracao_inicial,
  calibracao_final,
  hora_calibracao_inicio,   // ← novo
  hora_calibracao_fim,      // ← novo
  desvio,
  tempo_pausa,
  inicio_pausa,
  final_pausa,
  jornada_trabalho,
  observacao
}) {
  const text = `
    UPDATE public.medicao SET
      funcionario_id          = $1,
      equipamento_id          = $2,
      avaliador_id            = $3,
      status                  = $4,
      data_medicao            = $5,
      hora_inicio             = $6,
      hora_fim                = $7,
      tempo_mostragem         = $8,
      nen_q5                  = $9,
      lavg_q5                 = $10,
      nen_q3                  = $11,
      lavg_q3                 = $12,
      calibracao_inicial      = $13,
      calibracao_final        = $14,
      hora_calibracao_inicio  = $15,  -- ← novo
      hora_calibracao_fim     = $16,  -- ← novo
      desvio                  = $17,
      tempo_pausa             = $18,
      inicio_pausa            = $19,
      final_pausa             = $20,
      jornada_trabalho        = $21,
      observacao              = $22,
      updated_at              = now()
    WHERE id = $23
    RETURNING *`;
  const values = [
    funcionario_id, equipamento_id, avaliador_id, status,
    data_medicao, hora_inicio, hora_fim, tempo_mostragem,
    nen_q5, lavg_q5, nen_q3, lavg_q3,
    calibracao_inicial, calibracao_final,
    hora_calibracao_inicio, hora_calibracao_fim,  // ← novos
    desvio,
    tempo_pausa, inicio_pausa, final_pausa,
    jornada_trabalho, observacao,
    id
  ];
  const res = await pool.query(text, values);
  if (res.rowCount === 0) throw new ApiError(404, 'Medição não encontrada.');
  return res.rows[0];
}

async function deleteMedicao(id) {
  const res = await pool.query(`DELETE FROM public.medicao WHERE id = $1`, [id]);
  if (res.rowCount === 0) throw new ApiError(404, 'Medição não encontrada.');
  return true;
}

async function getMedicaoByFuncionario(funcionarioId) {
  const res = await pool.query(
    `SELECT * 
       FROM public.medicao 
      WHERE funcionario_id = $1 
      LIMIT 1`,
    [funcionarioId]
  );
  if (res.rowCount === 0) return null;
  return res.rows[0];
}

module.exports = {
  createMedicao,
  listMedicoes,
  getMedicaoById,
  updateMedicao,
  deleteMedicao,
  getMedicaoByFuncionario
};