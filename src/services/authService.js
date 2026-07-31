const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { jwtSecret, jwtExpiresIn } = require('../config');

async function login(email, password) {
  const user = userModel.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });

  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

module.exports = { login };
