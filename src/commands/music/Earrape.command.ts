import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Earrape extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "earrape",
      aliases: ["er", "bb"],
      description: "Self explanatory, isn't it?",
      usage: "<prefix>earrape",
      category: "Music",
    });
  }
  async run(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    const colors = this.client.config.colors;
    try {
      if (!guildQueue) {
        throw "Bot is not currently in voicechat";
      }
      if (!msg.member.voice) {
        throw "You're not currently in voice channel";
      }
      if (msg.member.voice.channel.id !== guildQueue.voiceChannel.id) {
        throw "You're not in the same voice chat as Snacky.";
      }
      if (!guildQueue.isPlaying) {
        throw "Bot is currently not playing any audio";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    let isEnabled: boolean;
    //toggle the value on current player
    guildQueue.earRape = isEnabled = !guildQueue.earRape;
    guildQueue.connection.dispatcher.setVolume(isEnabled ? 10.0 : 1.0);
    outputEmbed(
      msg.channel,
      isEnabled ? `Ah yes good 'ol earrape... Enjoy lmao` : `Earrape mode has been disabled`,
      {
        color: colors.success,
      }
    );
  }
}

module.exports = Earrape;
