import Command from './../command.js';
import messageHandler from '../../misc/messageHandler.js';
import {dic as language, replaceArgs} from '../../misc/languageHandler.js';
import config from '../../config.js';

export default class Config extends Command {
  constructor(category) {
    super(category);
    this.usage = `config --<option> <value>`;
    this.command = 'config';
    this.description = () => language.commands.config.description;
    this.example = 'config --cta-channel CTA';
    this.permissions = ['MANAGE_CHANNELS'];
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  executeCommand(args, msg, params) {
    try {
      super.executeCommand(args, msg, params);
    } catch (err) {
      return;
    }
    const paramArray = Object.entries(params);
    if (paramArray.length == 0) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: language.general.error,
        description: language.error.invalid_usage,
        categories: [{
          title: language.general.usage,
          text: `\`${this.usage}\``,
        }],
        color: 0xcc0000,
      });
      return;
    }

    Object.entries(params).forEach(([key, value])=>config.customSettings[key] = value);

    let savedConfigs = '';
    Object.entries(params).forEach( (item) => savedConfigs = savedConfigs+item[0]+' = '+item[1]+'\n');
    messageHandler.sendRichTextDefault({
      msg: msg,
      title: language.commands.config.labels.saved,
      categories: [{
        title: language.commands.config.labels.saved_configs,
        text: savedConfigs,
      }],
    });
    return;
  }
}
