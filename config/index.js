// config/index.js
require('dotenv').config();

const {
  PORT,
  API_TOKEN,
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

// Se você tiver definido DATABASE_URL (Neon), use-a com SSL habilitado
const dbConfig = DATABASE_URL
  ? {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host:     DB_HOST,
      port:     Number(DB_PORT),
      user:     DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl:      false
    };

module.exports = {
  port:     Number(PORT) || 3000,
  apiToken: API_TOKEN || '',
  db:       dbConfig
};