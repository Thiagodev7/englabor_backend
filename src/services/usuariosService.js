const pool = require('../db');
const bcrypt = require('bcrypt');

// Whitelist for safe ORDER BY mapping
const ORDERABLE_COLUMNS = new Set([
  'id', 'nome', 'cpf', 'email', 'telefone', 'role', 'created_at', 'updated_at'
]);

function sanitizeOrderBy(sortBy) {
  return ORDERABLE_COLUMNS.has(sortBy) ? sortBy : 'created_at';
}

function sanitizeSortDir(sortDir) {
  return String(sortDir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
}

/**
 * Create a new user
 */
async function createUser({ nome, cpf, email, telefone, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  const text = `INSERT INTO public.usuarios (nome, cpf, email, telefone, password, role)
                VALUES ($1,$2,$3,$4,$5,$6)
                RETURNING id, nome, cpf, email, telefone, role, created_at`;
  const values = [nome, cpf, email, telefone || null, hash, role || 'user'];
  const res = await pool.query(text, values);
  return res.rows[0];
}

/**
 * Update an existing user (no password change)
 */
async function updateUser(id, { nome, cpf, email, telefone, role }) {
  const text = `
    UPDATE public.usuarios
       SET nome = $1,
           cpf = $2,
           email = $3,
           telefone = $4,
           role = $5,
           updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, nome, cpf, email, telefone, role, created_at, updated_at
  `;
  const values = [nome, cpf, email, telefone || null, role || 'user', id];
  const res = await pool.query(text, values);
  return res.rows[0];
}

/**
 * Change a user's password (requires old password)
 */
async function changePassword(id, oldPassword, newPassword) {
  const user = await findById(id);
  if (!user) throw new Error('Usuário não encontrado.');
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return null;
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    `UPDATE public.usuarios
        SET password = $1,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
    [hash, id]
  );
  return true;
}

/**
 * Find a user by identifier (cpf OR email OR telefone)
 */
async function findByIdentifier(identifier) {
  const text = `SELECT id, nome, cpf, email, telefone, password, role
                  FROM public.usuarios
                 WHERE cpf=$1 OR email=$1 OR telefone=$1`;
  const res = await pool.query(text, [identifier]);
  return res.rows[0];
}

/**
 * Find a user by id
 */
async function findById(id) {
  const res = await pool.query(
    `SELECT id, nome, cpf, email, telefone, password, role, created_at, updated_at
       FROM public.usuarios
      WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

/**
 * List users with pagination + search + sorting
 */
async function listUsers({
  page = 1,
  limit = 20,
  q = '',
  role,
  sortBy = 'created_at',
  sortDir = 'desc',
}) {
  const offset = (page - 1) * limit;
  const orderBy = sanitizeOrderBy(sortBy);
  const direction = sanitizeSortDir(sortDir);

  const where = [];
  const params = [];
  let idx = 1;

  if (q && q.trim() !== '') {
    where.push(`(
      unaccent(nome) ILIKE unaccent($${idx}) OR
      cpf ILIKE $${idx} OR
      email ILIKE $${idx} OR
      telefone ILIKE $${idx}
    )`);
    params.push(`%${q.trim()}%`);
    idx++;
  }

  if (role) {
    where.push(`role = $${idx}`);
    params.push(role);
    idx++;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT id, nome, cpf, email, telefone, role, created_at, updated_at
      FROM public.usuarios
      ${whereSql}
     ORDER BY ${orderBy} ${direction}
     LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const countSql = `
    SELECT COUNT(*)::int AS total
      FROM public.usuarios
      ${whereSql}
  `;

  const listRes = await pool.query(sql, [...params, limit, offset]);
  const countRes = await pool.query(countSql, params);

  return {
    page,
    limit,
    total: countRes.rows[0].total,
    items: listRes.rows
  };
}

/**
 * Hard delete a user by id
 * (If you prefer soft delete, add a 'deleted_at TIMESTAMP NULL' column and switch to an UPDATE)
 */
async function deleteUser(id) {
  const res = await pool.query(
    `DELETE FROM public.usuarios WHERE id = $1 RETURNING id`,
    [id]
  );
  return res.rowCount > 0;
}

// NOVO: resetar senha sem exigir a senha antiga (p/ administrador)
async function resetPassword(id, newPassword = '123mudar') {
  const user = await findById(id, true);
  if (!user) throw new Error('Usuário não encontrado.');
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    `UPDATE public.usuarios
        SET password = $1,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
    [hash, id]
  );
  return true;
}

async function findByIdentifier(identifier) {
  const text = `SELECT id, nome, cpf, email, telefone, password, role
                  FROM public.usuarios
                 WHERE cpf=$1 OR email=$1 OR telefone=$1`;
  const res = await pool.query(text, [identifier]);
  return res.rows[0];
}

async function findById(id, withPassword = false) {
  const fields = withPassword
    ? 'id, nome, cpf, email, telefone, password, role, created_at, updated_at'
    : 'id, nome, cpf, email, telefone, role, created_at, updated_at';
  const res = await pool.query(
    `SELECT ${fields}
       FROM public.usuarios
      WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

module.exports = {
  // already existed in the original file
  createUser,
  updateUser,
  changePassword,
  findByIdentifier,
  findById,

  // new
  listUsers,
  deleteUser,
  resetPassword
};