const bcrypt = require('bcrypt');
const { findByIdentifier } = require('./usuariosService');

async function authenticate(identifier, password) {
  const user = await findByIdentifier(identifier);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  delete user.password;
  return user;
}

module.exports = { authenticate };
