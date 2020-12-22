import CmdHandler from './misc/commandHandler.js';
import DiscordHandler from './misc/discordHandler.js';
import SqlHandler from './misc/sqlHandler.js';
import config from './config.js';
import albionApiHandler from './misc/albionApiHandler';

DiscordHandler.client.on('ready', () => {
  console.log('N1ghtmare Bot is online!');
  DiscordHandler.client.user.setActivity('🦆Quack');
  albionApiHandler.fetchKills();
  setInterval(() => {
    albionApiHandler.fetchKills();
  }, 5000);
});

DiscordHandler.client.on('message', CmdHandler ? CmdHandler.parseCommand : () => {});

SqlHandler.initDB().then(() => {
  DiscordHandler.client.login(config.token);
});
