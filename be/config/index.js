require('dotenv').config()

const config = {
  server: 'localhost',
  database: 'InvoiceManagementDB',
  user: process.env.user,
  password: process.env.password,
  port: 1433,
  encrypt: false,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

module.exports = config