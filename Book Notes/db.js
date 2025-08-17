/**
 * db.js — PostgreSQL pool (pg)
 */
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || "booknotes",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || ""
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
