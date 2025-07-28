const pool = require('../db');
const bcrypt = require('bcrypt');

async function createUser({ nome, cpf, email, telefone, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  const text = `INSERT INTO public.usuarios (nome, cpf, email, telefone, password, role)
                VALUES ($1,$2,$3,$4,$5,$6)
                RETURNING id, nome, cpf, email, telefone, role, created_at`;
  const values = [nome, cpf, email, telefone || null, hash, role || 'user'];
  const res = await pool.query(text, values);
  return res.rows[0];
}

async function findByIdentifier(identifier) {
  const text = `SELECT id, nome, cpf, email, telefone, password, role
                FROM public.usuarios
                WHERE cpf=$1 OR email=$1 OR telefone=$1`;
  const res = await pool.query(text, [identifier]);
  return res.rows[0];
}

async function findById(id) {
  const res = await pool.query(
    `SELECT id, nome, cpf, email, telefone, password, role
     FROM public.usuarios WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

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

module.exports = {
  createUser,        // já existente
  findByIdentifier,  // já existente
  findById,
  updateUser,
  changePassword
};
