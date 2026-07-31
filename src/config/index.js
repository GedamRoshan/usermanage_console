require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'change-me-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
};
