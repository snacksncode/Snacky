import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Pause extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "pause",
      description: "Paused current music player",
      usage: "<prefix>pause",
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
      if (guildQueue.connection.dispatcher.paused) {
        throw "Bot is already paused";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    guildQueue.connection.dispatcher.pause(true);
    guildQueue.isPlaying = false;
    outputEmbed(msg.channel, "Paused current player", {
      color: colors.success,
    });
  }
}

module.exports = Pause;
