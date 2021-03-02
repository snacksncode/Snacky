import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Resume extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "resume",
      description: "Resumes current music player",
      usage: "<prefix>resume",
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
      if (!guildQueue.connection.dispatcher.paused) {
        throw "Playback is not currently paused";
      }
      if (!guildQueue.songs[0]) {
        throw "There are no songs in queue";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    guildQueue.connection.dispatcher.resume();
    guildQueue.isPlaying = true;
    outputEmbed(msg.channel, "Resumed current player", {
      color: colors.success,
      footerText: "It probably didn't. If you actually wanna resume playback just skip the song.",
    });
  }
}

module.exports = Resume;
