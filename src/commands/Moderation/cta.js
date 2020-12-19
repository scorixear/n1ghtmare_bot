import Command from './../command.js';
import messageHandler from '../../misc/messageHandler.js';
import {dic as language, replaceArgs} from '../../misc/languageHandler.js';
import config from '../../config.js';
import {Message} from 'discord.js';
import sqlHandler from '../../misc/sqlHandler.js';

export default class CTA extends Command {
  constructor(category) {
    super(category);
    this.usage = `cta <ZVZ Time> <Massup Time> [--location <location>/--hammers/--sets <number>]`;
    this.command = 'cta';
    this.description = () => language.commands.cta.description;
    this.example = 'cta 18 16:30 --location="Wetland Hideout" --hammers --sets=1';
    this.permissions = ['MANAGE_CHANNELS'];
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  async executeCommand(args, msg, params) {
    try {
      super.executeCommand(args, msg, params);
    } catch (err) {
      return;
    }
    if (args.length < 2) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: language.general.error,
        description: language.error.invalid_usage,
        categories: [{
          title: language.general.usage,
          text: `\`${this.usage}\``,
        }],
      });
      return;
    }

    let zvzutc = args[0];
    let massuputc = args[1];

    if (massuputc.includes(':')) {
      const split = massuputc.split(':');
      massuputc = new Date(1970, 1, 1, split[0], split[1], 0, 0);
    } else {
      massuputc = new Date(1970, 1, 1, massuputc, 0, 0, 0);
    }

    if (zvzutc.includes(':')) {
      const split = zvzutc.split(':');
      zvzutc = new Date(1970, 1, 1, split[0], split[1], 0, 0);
    } else {
      zvzutc = new Date(1970, 1, 1, zvzutc, 0, 0, 0);
    }

    const germanUTC = new Date(massuputc.getTime());
    const brasilianUTC = new Date(massuputc.getTime());
    brasilianUTC.setHours(massuputc.getHours() - 3);
    if (this.isDST(new Date())) {
      germanUTC.setHours(massuputc.getHours() + 2);
    } else {
      germanUTC.setHours(massuputc.getHours() + 1);
    }

    let location = 'Springsump Wetland';
    let hammers = false;
    let sets = 0;

    if (params.location) {
      location = params.location;
    }
    if (params.hammers !== undefined) {
      hammers=true;
    }
    if (params.sets) {
      sets = parseInt(params.sets);
    }
    const channelName = await sqlHandler.getConfigValue('cta-channel');
    // console.log(ctaChannel);
    if (!channelName) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: language.general.error,
        description: replaceArgs(language.commands.cta.error.missing_cta_channel, config.botPrefix),
        color: 0xcc0000,
      });
      return;
    }
    const channel = msg.guild.channels.cache.find((c)=>c.type === 'text' && c.name.includes(channelName));
    if (!channel) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: language.general.error,
        description: replaceArgs(language.commands.cta.error.channel_name_wrong, [channelName, config.botPrefix]),
        color: 0xcc0000,
      });
      return;
    }
    let setMessage = '';
    if (sets == 1) {
      setMessage = '\n' + language.commands.cta.text.more_sets_singular + '\n';
    } else if (sets > 1) {
      setMessage = '\n' + replaceArgs(language.commands.cta.text.more_sets, [sets]) + '\n';
    }
    channel.send('@everyone');
    messageHandler.sendRichTextDefaultExplicit({
      guild: msg.guild,
      channel: channel,
      color: 0xcc0000,
      thumbnail: 'nightmare.png',
      title: language.commands.cta.labels.cta_call,
      description: replaceArgs(language.commands.cta.text.cta_description, [
        this.getDoubleDigitTime(zvzutc),
        this.getDoubleDigitTime(massuputc),
        this.getDoubleDigitTime(germanUTC),
        this.getDoubleDigitTime(brasilianUTC),
        hammers?'\n'+language.commands.cta.text.hammers+'\n':'',
        setMessage]),
      footer: location,
    });
  }

  /**
   *
   * @param {Date} date
   * @return {bool}
   */
  isDST(date) {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) != date.getTimezoneOffset();
  }

  /**
   *
   * @param {Date} date
   * @return {string}
   */
  getDoubleDigitTime(date) {
    return `${(date.getHours()<10?'0':'') + date.getHours()}:${(date.getMinutes()<10?'0':'') + date.getMinutes()}`;
  }
}
