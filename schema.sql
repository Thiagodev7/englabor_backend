-- 1) usuários
CREATE TABLE usuarios (
  id               SERIAL PRIMARY KEY,
  nome             TEXT    NOT NULL,
  email            TEXT    UNIQUE NOT NULL,
  senha            TEXT    NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) empresas
CREATE TABLE empresas (
  id               SERIAL PRIMARY KEY,
  nome             TEXT    NOT NULL,
  cnpj             TEXT    UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) funcionários
CREATE TABLE funcionarios (
  id               SERIAL PRIMARY KEY,
  empresa_id       INTEGER NOT NULL REFERENCES empresas(id),
  nome             TEXT    NOT NULL,
  matricula        TEXT,
  medicao_status   VARCHAR(20),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) equipamentos
CREATE TABLE equipamentos (
  id               SERIAL PRIMARY KEY,
  tipo             TEXT    NOT NULL,
  marca            TEXT,
  modelo           TEXT,
  numero_serie     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) medições
CREATE TABLE medicao (
  id                  SERIAL PRIMARY KEY,
  funcionario_id      INTEGER NOT NULL REFERENCES funcionarios(id),
  equipamento_id      INTEGER       REFERENCES equipamentos(id),
  avaliador_id        INTEGER NOT NULL REFERENCES usuarios(id),
  status              VARCHAR(50) NOT NULL,
  data_medicao        DATE,
  hora_inicio         TIME,
  hora_fim            TIME,
  tempo_mostragem     INTERVAL,
  nen_q5              DOUBLE PRECISION,
  lavg_q5             DOUBLE PRECISION,
  nen_q3              DOUBLE PRECISION,
  lavg_q3             DOUBLE PRECISION,
  calibracao_inicial  DOUBLE PRECISION,
  calibracao_final    DOUBLE PRECISION,
  desvio              DOUBLE PRECISION,
  tempo_pausa         INTERVAL,
  inicio_pausa        TIME,
  final_pausa         TIME,
  jornada_trabalho    INTERVAL,
  observacao          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);