import request from 'request';
import config from '../config';
import sqlHandler from './sqlHandler';
import discordHandler from './discordHandler';
import messageHandler from './messageHandler';
import {dic as language, replaceArgs} from './languageHandler.js';
import logger from './logger';
const baseUri = 'https://gameinfo.albiononline.com/api/gameinfo/';
const eventUri = 'events';
let replacementChannel;

async function fetchKills(limit = 51, offset = 0) {
  replacementChannel = await sqlHandler.getConfigValue('replacement-channel');
  logger.log('Fetching Kills from AlbionOnline');
  request({
    uri: `${baseUri}${eventUri}?limit=${limit}&offset=${offset}`,
    json: true,
  }, (error, response, body) => {
    if (!error) {
      if (response.statusCode === 200) {
        parseKills(body);
      } else {
        logger.err('Albion API BAD Request: ', response, body);
      }
    } else {
      logger.err('Albion API Error: ', error);
    }
  });
}

function parseKills(events) {
  let count = 0;
  for(const kill of events) {
    //console.log(kill.EventId)
    if (config.trackedGuilds.find((guild)=>guild.toLowerCase() === kill.Victim.GuildName.toLowerCase()) && !config.trackedGuilds.find((guild)=>guild.toLowerCase() === kill.Killer.GuildName.toLowerCase()) && kill.TotalVictimKillFame != 0) {
      console.log(kill.Victim.Name + ' <-- '+kill.Killer.Name);
      handleDeath(kill);
    }
  }
}

async function handleDeath(killEvent) {
  const botGuilds = discordHandler.client.guilds.cache;

  if (!replacementChannel) {
    for (const [snowflake, botGuild] of botGuilds) {
      const channel = botGuild.channels.cache.find((c) => c.name.match(config.botChannel));
      if (channel) {
        messageHandler.sendRichTextDefaultExplicit({
          guild: botGuild,
          channel: channel,
          title: language.general.error,
          description: replaceArgs(language.handlers.killBot.error.missing_replacement_channel, [config.botPrefix]),
          color: 0xcc0000,
        });
      } else {
        console.log('Could not find botChannel for guild ', botGuild.name);
      }
    }
    return;
  }


  const alreadyExistent = await sqlHandler.saveKillboard(killEvent.EventId, killEvent.Victim.Name, killEvent.Killer.Name, killEvent.Killer.GuildName.ToString(), new Date(killEvent.TimeStamp.ToString()));

  if(!alreadyExistent) {
    for (const [snowflake, botGuild] of botGuilds) {
      if (botGuild.name !== config.botGuild) continue;
      // console.log(botGuild);
      const channel = botGuild.channels.cache.find((c) => c.name.includes(replacementChannel));
      // console.log(replacementChannel, channel);
      if (channel) {
        messageHandler.sendRichTextDefaultExplicit({
          guild: botGuild,
          channel: channel,
          title: language.handlers.killBot.title,
          description: replaceArgs(language.handlers.killBot.description, [killEvent.Victim.Name]),
          color: 0xcc0000,
          categories: [
            {
              title: replaceArgs(language.handlers.killBot.killed, [killEvent.Killer.Name, killEvent.Victim.Name]),
              text: `https://albiononline.com/en/killboard/kill/${killEvent.EventId}`,
            },
          ],
          // image: createImage(),
          footer: parseTimestamp(killEvent.TimeStamp),
        });
      }
    }
  }
}

function createImage() {

}

function parseTimestamp(timestamp) {
  const date = new Date(Date.parse(timestamp));
  return `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
}

export default {
  fetchKills,
}
