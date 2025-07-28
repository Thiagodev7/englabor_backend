const pool     = require('../db');
const ApiError = require('../utils/ApiError');

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
      calibracao_inicial, calibracao_final, desvio,
      tempo_pausa, inicio_pausa, final_pausa,
      jornada_trabalho, observacao,
      created_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,
      $5,$6,$7,$8,
      $9,$10,$11,$12,
      $13,$14,$15,
      $16,$17,$18,
      $19,$20,
      now(), now()
    )
    RETURNING *`;
  const values = [
    funcionario_id,
    equipamento_id,
    avaliador_id,
    status,
    data_medicao,
    hora_inicio,
    hora_fim,
    // se for string vazia, envia null
    tempo_mostragem || null,
    nen_q5,
    lavg_q5,
    nen_q3,
    lavg_q3,
    calibracao_inicial,
    calibracao_final,
    desvio,
    tempo_pausa || null,
    inicio_pausa,
    final_pausa,
    jornada_trabalho,
    observacao
  ];
  const res = await pool.query(text, values);
  return res.rows[0];
}

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
  desvio,
  tempo_pausa,
  inicio_pausa,
  final_pausa,
  jornada_trabalho,
  observacao
}) {
  const text = `
    UPDATE public.medicao SET
      funcionario_id     = $1,
      equipamento_id     = $2,
      avaliador_id       = $3,
      status             = $4,
      data_medicao       = $5,
      hora_inicio        = $6,
      hora_fim           = $7,
      tempo_mostragem    = $8,
      nen_q5             = $9,
      lavg_q5            = $10,
      nen_q3             = $11,
      lavg_q3            = $12,
      calibracao_inicial = $13,
      calibracao_final   = $14,
      desvio             = $15,
      tempo_pausa        = $16,
      inicio_pausa       = $17,
      final_pausa        = $18,
      jornada_trabalho   = $19,
      observacao         = $20,
      updated_at         = now()
    WHERE id = $21
    RETURNING *`;
  const values = [
    funcionario_id,
    equipamento_id,
    avaliador_id,
    status,
    data_medicao,
    hora_inicio,
    hora_fim,
    tempo_mostragem || null,
    nen_q5,
    lavg_q5,
    nen_q3,
    lavg_q3,
    calibracao_inicial,
    calibracao_final,
    desvio,
    tempo_pausa || null,
    inicio_pausa,
    final_pausa,
    jornada_trabalho,
    observacao,
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