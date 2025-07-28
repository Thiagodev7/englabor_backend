--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: consorcio; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA consorcio;


--
-- Name: tipo_assembleia; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_assembleia AS ENUM (
    'AGO',
    'AGE'
);


--
-- Name: atualiza_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.atualiza_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: trg_medicao_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_medicao_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: empresas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresas (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    cnpj character varying(18) NOT NULL
);


--
-- Name: empresas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.empresas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: empresas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.empresas_id_seq OWNED BY public.empresas.id;


--
-- Name: equipamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipamentos (
    id integer NOT NULL,
    tipo character varying(255) NOT NULL,
    marca character varying(255) NOT NULL,
    modelo character varying(255) NOT NULL,
    numero_serie character varying(100) NOT NULL,
    data_ultima_calibracao date NOT NULL,
    numero_certificado character varying(100) NOT NULL,
    data_vencimento date NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: equipamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipamentos_id_seq OWNED BY public.equipamentos.id;


--
-- Name: funcionarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funcionarios (
    id integer NOT NULL,
    empresa_id integer,
    setor character varying(100),
    ghe character varying(100),
    cargo character varying(100),
    matricula character varying(50),
    nome character varying(255)
);


--
-- Name: funcionarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.funcionarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: funcionarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.funcionarios_id_seq OWNED BY public.funcionarios.id;


--
-- Name: medicao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medicao (
    id integer NOT NULL,
    funcionario_id integer NOT NULL,
    equipamento_id integer NOT NULL,
    avaliador_id integer NOT NULL,
    data_medicao date,
    hora_inicio time without time zone,
    hora_fim time without time zone,
    tempo_mostragem interval,
    nen_q5 numeric(12,4),
    lavg_q5 numeric(12,4),
    nen_q3 numeric(12,4),
    lavg_q3 numeric(12,4),
    calibracao_inicial numeric(12,4),
    calibracao_final numeric(12,4),
    desvio numeric(12,4),
    tempo_pausa interval,
    inicio_pausa time without time zone,
    final_pausa time without time zone,
    jornada_trabalho interval,
    observacao text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status character varying(50) NOT NULL
);


--
-- Name: medicao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medicao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medicao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medicao_id_seq OWNED BY public.medicao.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    cpf character varying(14) NOT NULL,
    email character varying(100) NOT NULL,
    telefone character varying(20),
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: empresas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas ALTER COLUMN id SET DEFAULT nextval('public.empresas_id_seq'::regclass);


--
-- Name: equipamentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipamentos ALTER COLUMN id SET DEFAULT nextval('public.equipamentos_id_seq'::regclass);


--
-- Name: funcionarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionarios ALTER COLUMN id SET DEFAULT nextval('public.funcionarios_id_seq'::regclass);


--
-- Name: medicao id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicao ALTER COLUMN id SET DEFAULT nextval('public.medicao_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: empresas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empresas (id, nome, cnpj) FROM stdin;
9	Thiago Ribeiro dos Santos Consultori	58.866.007/0001-70
10	teste	27.381.500/0001-77
\.


--
-- Data for Name: equipamentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipamentos (id, tipo, marca, modelo, numero_serie, data_ultima_calibracao, numero_certificado, data_vencimento, created_at, updated_at) FROM stdin;
1	Audiodosimetro de Ruido	Chrompack	SmartdB	4696	2024-08-07	159.39	2026-08-07	2025-07-04 12:53:59.298506	2025-07-08 16:55:44.260329
2	teste	teste	teste	teste	2025-07-08	tete	2025-07-31	2025-07-08 16:56:06.098793	2025-07-08 16:56:06.098793
\.


--
-- Data for Name: funcionarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.funcionarios (id, empresa_id, setor, ghe, cargo, matricula, nome) FROM stdin;
7	9	TI	Setor X	Analista	123ABC	Fulano Silva
9	9	RH	Setor Z	Coordenador	789GHI	Carlos Souza
10	9	TI	Setor X	Analista	123ABC	Fulano Silva
11	9	Financeiro	Setor Y	Contadora	456DEF	Maria Oliveira
12	9	RH	Setor Z	Coordenador	789GHI	Carlos Souza
13	9	TI	Setor X	Analista	123ABC	Fulano Silva
8	9	Financeiro	Setor Y	Contadora	456DEF	noiva Oliveira
18	10	Qualidade	GHE1	Analista	A123	Ana Souza
19	10	Manutenção	GHE3	Supervisor	C789	Carla Dias
20	10	Produção	GHE5	Encarregado	E345	Eduarda Maia
21	10	Financeiro	GHE2	Analista	G901	Gabriela Rocha
22	10	Recursos Humanos	GHE4	Coordenador	I567	Isabela Fernandes
24	9	Manutenção	GHE3	Supervisor	C789	Carla Dias
25	9	Produção	GHE5	Encarregado	E345	Eduarda Maia
26	9	Financeiro	GHE2	Analista	G901	Gabriela Rocha
27	9	Recursos Humanos	GHE4	Coordenador	I567	Isabela Fernandes
23	9	Qualidade	GHE1	Analista	A1234	Ana Souza
\.


--
-- Data for Name: medicao; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medicao (id, funcionario_id, equipamento_id, avaliador_id, data_medicao, hora_inicio, hora_fim, tempo_mostragem, nen_q5, lavg_q5, nen_q3, lavg_q3, calibracao_inicial, calibracao_final, desvio, tempo_pausa, inicio_pausa, final_pausa, jornada_trabalho, observacao, created_at, updated_at, status) FROM stdin;
33	18	1	2	\N	\N	\N	\N	50.0000	12.0000	50.0000	12.0000	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-11 14:31:07.769672	2025-07-11 14:51:33.008497	ABERTO
35	20	1	2	\N	\N	\N	\N	\N	\N	\N	19.0000	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-11 15:12:46.887025	2025-07-11 15:12:46.887025	ABERTO
34	19	1	2	\N	\N	\N	\N	\N	25.0000	\N	\N	\N	\N	35.0000	\N	\N	\N	\N	\N	2025-07-11 15:02:21.903542	2025-07-11 15:13:09.961276	CONCLUIDO
36	23	1	2	2025-07-15	09:17:00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-17 09:18:48.726241	2025-07-17 09:19:01.351494	CONCLUIDO
37	24	1	2	2025-07-16	10:00:00	16:30:00	06:00:00	13.0000	12.0000	25.0000	\N	\N	\N	14.0000	00:30:00	00:00:00	00:30:00	00:20:34	\N	2025-07-23 09:00:20.097071	2025-07-23 09:24:04.909573	CONCLUIDO
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, nome, cpf, email, telefone, password, role, created_at, updated_at) FROM stdin;
3	João da Silva	123.456.789-00	joao.silva@example.com	11988887777	$2b$10$7RE/l4aYCm7.Zwjr0DmmzugrLjOwZ7nbXjQbXKASrye6815gX4KdK	user	2025-07-03 15:49:46.395838	2025-07-03 16:05:09.556554
1	Maria de Souza	987.654.321-00	maria.souza@example.com	11977776666	$2b$10$xEz246gIiCnHEL9GkHwvC.2OcDvCT1UNNi5/YgponMNLmFWnlt1kG	admin	2025-07-01 20:54:19.64227	2025-07-03 16:05:23.187489
2	Thiago Ribeiro	04964741117	thiago@email.com	62996509914	$2b$10$Awa4v1vV6FmvCS55xBR/nOFZNVZA7TDcNfE2DDa7IIeHUJK9b6mgi	admin	2025-07-01 20:58:21.27064	2025-07-03 18:31:09.923484
\.


--
-- Name: empresas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empresas_id_seq', 10, true);


--
-- Name: equipamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipamentos_id_seq', 2, true);


--
-- Name: funcionarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.funcionarios_id_seq', 27, true);


--
-- Name: medicao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.medicao_id_seq', 37, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 5, true);


--
-- Name: empresas empresas_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_cnpj_key UNIQUE (cnpj);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);


--
-- Name: equipamentos equipamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipamentos
    ADD CONSTRAINT equipamentos_pkey PRIMARY KEY (id);


--
-- Name: funcionarios funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_pkey PRIMARY KEY (id);


--
-- Name: medicao medicao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicao
    ADD CONSTRAINT medicao_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_cpf_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_cpf_key UNIQUE (cpf);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: medicao medicao_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER medicao_updated_at BEFORE UPDATE ON public.medicao FOR EACH ROW EXECUTE FUNCTION public.trg_medicao_updated_at();


--
-- Name: usuarios trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: funcionarios funcionarios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: medicao medicao_avaliador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicao
    ADD CONSTRAINT medicao_avaliador_id_fkey FOREIGN KEY (avaliador_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: medicao medicao_equipamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicao
    ADD CONSTRAINT medicao_equipamento_id_fkey FOREIGN KEY (equipamento_id) REFERENCES public.equipamentos(id) ON DELETE RESTRICT;


--
-- Name: medicao medicao_funcionario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicao
    ADD CONSTRAINT medicao_funcionario_id_fkey FOREIGN KEY (funcionario_id) REFERENCES public.funcionarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

