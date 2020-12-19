import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./src/config.json'));
config.version = JSON.parse(fs.readFileSync('package.json')).version;
config.customSettings = {};

export default config;
