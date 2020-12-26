import dateFormater from "./dateFormater";

function log(input, ...args) {
    fullLog(input, 'INFO', ...args);
}

function err (input, ...args) {
    fullLog(input, 'ERROR', ...args);
}
function fullLog(input, type, ...args) {
    const dateString = dateFormater.formatToTime(new Date());
    if(args && args.length > 0) {
        console.log(`[${dateString}] [${type}] ${input}`, ...args)
    } else {
        console.log(`[${dateString}] [${type}] ${input}`);
    }   
}

export default {
    log,
    err,
    fullLog,
}