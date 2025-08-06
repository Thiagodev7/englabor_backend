// src/services/relatorioService.js

const pool = require('../db');
const ApiError = require('../utils/ApiError');

async function getRelatorioByMatricula(matricula) {
  // 1) Empresa + funcionário
  const funcText = `
    SELECT
      f.id           AS funcionario_id,
      f.nome         AS funcionario_nome,
      f.matricula    AS funcionario_matricula,
      f.setor        AS funcionario_setor,
      f.ghe          AS funcionario_ghe,
      f.cargo        AS funcionario_cargo,
      e.id           AS empresa_id,
      e.nome         AS empresa_nome,
      e.cnpj         AS empresa_cnpj
    FROM public.funcionarios f
    JOIN public.empresas e
      ON f.empresa_id = e.id
    WHERE f.matricula = $1
  `;
  const funcRes = await pool.query(funcText, [matricula]);
  if (funcRes.rowCount === 0) {
    throw new ApiError(404, `Nenhum funcionário encontrado com matrícula "${matricula}".`);
  }
  const func = funcRes.rows[0];

  // 2) Última medição para aquele funcionário
  const medText = `
    SELECT *
      FROM public.medicao
     WHERE funcionario_id = $1
  ORDER BY data_medicao DESC
     LIMIT 1
  `;
  const medRes = await pool.query(medText, [func.funcionario_id]);
  if (medRes.rowCount === 0) {
    throw new ApiError(404, `Nenhuma medição encontrada para o funcionário ID ${func.funcionario_id}.`);
  }
  const med = medRes.rows[0];

  // 3) Equipamento
  const eqText = `
    SELECT id, tipo, marca, modelo, numero_serie
      FROM public.equipamentos
     WHERE id = $1
  `;
  const eqRes = await pool.query(eqText, [med.equipamento_id]);
  const eq = eqRes.rowCount ? eqRes.rows[0] : null;

  // 4) Avaliador (usuário)
  const avText = `
    SELECT id AS avaliador_id, nome AS avaliador_nome, email AS avaliador_email
      FROM public.usuarios
     WHERE id = $1
  `;
  const avRes = await pool.query(avText, [med.avaliador_id]);
  const av = avRes.rowCount ? avRes.rows[0] : null;

  // Monta retorno
  return {
    empresa:   { id: func.empresa_id, nome: func.empresa_nome, cnpj: func.empresa_cnpj },
    funcionario: {
      id: func.funcionario_id,
      nome: func.funcionario_nome,
      matricula: func.funcionario_matricula,
      setor: func.funcionario_setor,
      ghe: func.funcionario_ghe,
      cargo: func.funcionario_cargo
    },
    medicao: {
      id: med.id,
      status: med.status,
      data_medicao: med.data_medicao,
      hora_inicio: med.hora_inicio,
      hora_fim: med.hora_fim,
      tempo_mostragem: med.tempo_mostragem,
      tempo_pausa: med.tempo_pausa,
      jornada_trabalho: med.jornada_trabalho,
      nen_q5: med.nen_q5,
      lavg_q5: med.lavg_q5,
      nen_q3: med.nen_q3,
      lavg_q3: med.lavg_q3,
      calibracao_inicial: med.calibracao_inicial,
      calibracao_final: med.calibracao_final
    },
    equipamento: eq,
    avaliador: av
  };
}

module.exports = {
  getRelatorioByMatricula
};