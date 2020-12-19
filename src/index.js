import CmdHandler from './misc/commandHandler.js';
import DiscordHandler from './misc/discordHandler.js';
import SqlHandler from './misc/sqlHandler.js';
import config from './config.js';

DiscordHandler.client.on('ready', () => {
  console.log('N1ghtmare Bot is online!');
});

DiscordHandler.client.on('message', CmdHandler ? CmdHandler.parseCommand : () => {});

SqlHandler.initDB().then(() => {
  DiscordHandler.client.login(config.token);
});
