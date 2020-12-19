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
  // let conn;
  // try {
  //   console.log('Start DB Connection');
  //   conn = await pool.getConnection();
  //   console.log('DB Connection established');
  //   await conn.query('CREATE TABLE IF NOT EXISTS `honor` (`user_id` VARCHAR(255), `val` INT, PRIMARY KEY (`user_id`))');
  // } catch (err) {
  //   throw err;
  // } finally {
  //   if (conn) return conn.end();
  // }
}

export default {
  initDB,
  pool,
};
