// File: config/db.js

const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// const db = mysql.createPool({
//   host: process.env.DB_LOCAL_HOST,
//   user: process.env.DB_LOCAL_USER,
//   password: process.env.DB_LOCAL_PASSWORD,
//   database: process.env.DB_LOCAL_NAME,
//   port: process.env.DB_LOCAL_PORT,
// });

module.exports = db;
