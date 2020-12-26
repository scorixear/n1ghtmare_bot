/**
 * 
 * @param {Date} date 
 * @return {string}
 */
function formatToSQLDateTime(date) {
    return `${date.getUTCFullYear()}-${date.getUTCMonth().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}-${date.getUTCDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})} ${date.getUTCHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${date.getUTCMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${date.getUTCSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`;
}

/**
 * 
 * @param {Date} date
 * @return {string} 
 */
function formatToTime(date) {
    return `${date.getUTCHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${date.getUTCMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${date.getUTCSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`;
}

export default {
    formatToSQLDateTime,
    formatToTime,
}