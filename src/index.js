import CmdHandler from './misc/commandHandler.js';
import DiscordHandler from './misc/discordHandler.js';
import SqlHandler from './misc/sqlHandler.js';
import config from './config.js';
import albionApiHandler from './misc/albionApiHandler';
import logger from './misc/logger.js';

DiscordHandler.client.on('ready', () => {
  logger.log('N1ghtmare Bot is online!');
  DiscordHandler.client.user.setActivity('🦆Quack');
  albionApiHandler.fetchKills();
  setInterval(() => {
    albionApiHandler.fetchKills();
  }, 20000);
});

DiscordHandler.client.on('message', CmdHandler ? CmdHandler.parseCommand : () => {});

SqlHandler.initDB().then(() => {
  DiscordHandler.client.login(config.token);
}).catch((reason=>console.error(reason)));
