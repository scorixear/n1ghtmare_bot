/* eslint-disable max-len */
import mariadb from 'mariadb';
import config from './../config.js';
// eslint-disable-next-line no-unused-vars
import Discord from 'discord.js';

const pool = mariadb.createPool({
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpassword,
  port: config.dbport,
  database: config.dbDataBase,
  multipleStatements: true,
  connectionLimit: 5,
});

/**
 * Initialized the Database
 */
async function initDB() {
  let conn;
  try {
    console.log('Start DB Connection');
    conn = await pool.getConnection();
    console.log('DB Connection established');
    await conn.query('CREATE TABLE IF NOT EXISTS `config` (`key` VARCHAR(255), `value` VARCHAR(255), PRIMARY KEY (`key`))');
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

/**
 *
 * @param {string} key
 * @param {string} value
 */
async function saveConfig(key, value) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`INSERT INTO \`config\` VALUES (${pool.escape(key)}, ${pool.escape(value)})`);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

/**
 *
 * @param {string} key
 * @return {string}
 */
async function getConfigValue(key) {
  let conn;
  let returnValue = undefined;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT \`value\` FROM \`config\` WHERE \`key\` = ${pool.escape(key)}`);
    if (rows && rows[0]) {
      returnValue = rows[0].value;
    }
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
    return returnValue;
  }
}

export default {
  initDB,
  saveConfig,
  getConfigValue,
  pool,
};
