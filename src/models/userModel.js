const db = require('../db');

function findByEmail(email) {
  const stmt = db.prepare('SELECT id, email, password, name, role, status FROM users WHERE email = ?');
  return stmt.get(email);
}

function createUser({ email, password, name, phone }) {
  const stmt = db.prepare("INSERT INTO users (email, password, name, phone, role, status) VALUES (?, ?, ?, ?, 'USER', 'ACTIVE')");
  const info = stmt.run(email, password, name, phone || null);
  return { id: info.lastInsertRowid, email, name, role: 'USER', status: 'ACTIVE' };
}

function findById(id) {
  const stmt = db.prepare('SELECT id, email, name, role, status FROM users WHERE id = ?');
  return stmt.get(id);
}

function findByPhone(phone) {
  const stmt = db.prepare('SELECT id, email, phone, name, role, status FROM users WHERE phone = ?');
  return stmt.get(phone);
}

module.exports = { findByEmail, createUser, findById, findByPhone };

