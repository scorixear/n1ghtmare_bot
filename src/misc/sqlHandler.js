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
    await conn.query('CREATE TABLE IF NOT EXISTS `cta` (`id` INT NOT NULL AUTO_INCREMENT, `time` BIGINT NOT NULL UNIQUE, PRIMARY KEY(`id`))');
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

/**
 *
 * @param {number} time
 */
async function saveCTA(time) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT \`id\` FROM \`cta\` WHERE \`time\`=${pool.escape(time)}`);
    if (!rows || !rows[0]) {
      await conn.query(`INSERT INTO \`cta\` (\`time\`) VALUES (${pool.escape(time)})`);
    }
    const today = new Date();
    await conn.query(`DELETE FROM \`cta\` WHERE \`time\` < ${today.getTime()}`);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

/**
 *
 * @param {number} afterTime
 * @return {Array<number>}
 */
async function getCTA(afterTime) {
  let conn;
  let ctaTimes = [];
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT \`time\` FROM \`cta\` WHERE \`time\` > ${pool.escape(afterTime)}`);
    if (rows && rows[0]) {
      for (const row of rows) {
        if (row.time) {
          ctaTimes = [...ctaTimes, row.time];
        }
      }
    }
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
    return ctaTimes;
  }
}


/**
 *
 * @param {string} key
 * @param {string} value
 */
async function saveConfig(key, value) {
  let conn;
  console.log('Here, do this');
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT \`value\` FROM \`config\` WHERE \`key\` = ${pool.escape(key)}`);
    // console.log(rows);
    if (rows && rows[0]) {
      if (value) {
        // console.log('value: '+value);
        await conn.query(`UPDATE \`config\` SET \`value\` = ${pool.escape(value)} WHERE \`key\` = ${pool.escape(key)}`);
      } else {
        await conn.query(`DELETE FROM \`config\` WHERE \`key\` = ${pool.escape(key)}`);
      }
    } else {
      await conn.query(`INSERT INTO \`config\` VALUES (${pool.escape(key)}, ${pool.escape(value)})`);
    }
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
  saveCTA,
  getCTA,
  pool,
};
