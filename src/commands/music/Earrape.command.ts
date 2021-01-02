import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Earrape extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "earrape",
      aliases: ["er"],
      description: "Self explanatory, isn't it?",
      usage: "<prefix>earrape",
      category: "Music",
    });
  }
  run(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    let isEnabled: boolean;
    //toggle the value on current player
    guildQueue.bassboost = isEnabled = !guildQueue.bassboost;
    guildQueue.connection.dispatcher.setVolume(isEnabled ? 10.0 : 1.0);
    outputEmbed(
      msg.channel,
      isEnabled
        ? `Ah yes good 'ol earrape... Enjoy lmao`
        : `Earrape mode has been disabled`,
      {
        color: this.client.config.colors.success,
      }
    );
  }
}

module.exports = Earrape;
