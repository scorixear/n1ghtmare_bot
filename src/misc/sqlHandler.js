/* eslint-disable max-len */
import mariadb from 'mariadb';
import config from './../config.js';
// eslint-disable-next-line no-unused-vars
import Discord from 'discord.js';
import dateFormater from './dateFormater.js';
import logger from './logger.js';

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
    logger.log('Start DB Connection');
    conn = await pool.getConnection();
    logger.log('DB Connection established');
    await conn.query('CREATE TABLE IF NOT EXISTS `config` (`key` VARCHAR(255), `value` VARCHAR(255), PRIMARY KEY (`key`))');
    await conn.query('CREATE TABLE IF NOT EXISTS `cta` (`id` INT NOT NULL AUTO_INCREMENT, `massupTime` BIGINT NOT NULL, `zvzTime` BIGINT NOT NULL UNIQUE, PRIMARY KEY(`id`))');
    await conn.query('CREATE TABLE IF NOT EXISTS `killboard` (`id` INT NOT NULL AUTO_INCREMENT, `victim` VARCHAR(255), `killer` VARCHAR(255), `killer_guild` VARCHAR(255), `eventId` INT NOT NULL UNIQUE, `time` DATETIME, PRIMARY KEY(`id`))');
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

/**
 *
 * @param {number} zvzTime
 * @param {number} massupTime
 */
async function saveCTA(zvzTime, massupTime) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT \`id\` FROM \`cta\` WHERE \`zvzTime\`=${pool.escape(zvzTime)}`);
    if (!rows || !rows[0]) {
      await conn.query(`INSERT INTO \`cta\` (\`zvzTime\`, \`massupTime\`) VALUES (${pool.escape(zvzTime)}, ${pool.escape(massupTime)})`);
    } else {
      await conn.query(`UPDATE \`cta\` SET \`massupTime\`=${pool.escape(massupTime)} WHERE \`zvzTime\`=${pool.escape(zvzTime)}`);
    }
    const today = new Date();
    today.setDate(today.getDate() - 2);
    await conn.query(`DELETE FROM \`cta\` WHERE \`zvzTime\` < ${today.getTime()}`);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

/**
 *
 * @param {number} killTime
 * @return {Array<number>}
 */
async function hasCTA(killTime) {
  let conn;
  let returnValue = false;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT \`id\` FROM \`cta\` WHERE \`massupTime\` < ${pool.escape(killTime)} AND  \`zvzTime\` >= ${pool.escape(killTime - (15 * 1000 * 60))}`);
    if (rows && rows[0]) {
      returnValue = true;
    }
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
    return returnValue;
  }
}


/**
 * 
 * @param {number} eventid 
 * @param {string} victim 
 * @param {string} killer 
 * @param {string} killerGuild 
 * @param {Date} date 
 */
async function saveKillboard(eventid, victim, killer, killerGuild, date) {
  let conn;
  let returnValue = false;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT \`id\` FROM \`killboard\` WHERE \`eventId\`=${pool.escape(eventid)}`);
    if (rows && rows[0]) {
      returnValue =  true;
    }
    else {
      const dateString = dateFormater.formatToSQLDateTime(date);
      await conn.query(`INSERT INTO \`killboard\` (\`eventId\`, \`victim\`, \`killer\`, \`killer_guild\`, \`time\`) VALUES (${pool.escape(eventid)}, ${pool.escape(victim)}, ${pool.escape(killer)}, ${pool.escape(killerGuild)}, ${pool.escape(dateString)})`);
    }

    const today = new Date();
    today.setDate(today.getDate() - 10);
    const todayString = dateFormater.formatToSQLDateTime(today);
    await conn.query(`DELETE FROM \`killboard\` WHERE \`time\` < ${pool.escape(todayString)}`);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
    return returnValue;
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
  hasCTA,
  saveKillboard,
  pool,
};
