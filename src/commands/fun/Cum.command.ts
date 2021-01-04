import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Cum extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "cum",
      description: "Sets your nickname to cum",
      usage: "<prefix>cum",
      aliases: ["cummies"],
      category: "Fun",
      hidden: true,
    });
  }

  async run(msg: Message) {
    msg.member
      .setNickname("cum")
      .then((_) => {
        msg.channel.send(
          `:sweat_drops: I declare you the lord of **cum** :sweat_drops:`
        );
      })
      .catch((_) => {
        outputEmbed(
          msg.channel,
          `I cannot change your nickname because of how discord permissions work.`,
          {
            color: this.client.config.colors.warn,
          }
        );
      });
  }
}

module.exports = Cum;
