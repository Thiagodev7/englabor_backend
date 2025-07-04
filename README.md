# EngLabor Backend

Este é o backend do projeto EngLabor, implementado em Node.js com:

- Express
- PostgreSQL (pg)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Autenticação via token fixo
- Melhorias de segurança, validação e qualidade de código

## Setup

1. Copie `.env.example` para `.env` e ajuste suas variáveis:
   ```bash
   cp .env.example .env
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Para desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse a documentação Swagger em:
   ```
   http://localhost:<PORT>/api-docs
   ```

## Scripts

- `npm run dev`: inicia com nodemon
- `npm run lint`: verifica estilo com ESLint
- `npm run format`: formata com Prettier
- `npm test`: executa testes com Jest

## Estrutura

- `src/app.js`: arquivo principal
- `src/config/`: configurações
- `src/db.js`: conexão ao banco
- `src/middlewares/`: auth, errorHandler
- `src/services/`: abstração de lógica de negócios
- `src/routes/`: definem endpoints
- `swagger/swagger.js`: opções do Swagger
# englabor_backend
