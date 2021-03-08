import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Stop extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "stop",
      description: "Stops current music playback, leaves VC and clears queue.",
      usage: `<prefix>stop`,
      category: "Music",
    });
  }

  async run(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    try {
      if (!msg.member.voice.channel) {
        throw "You have to be in a voice channel to stop the music.";
      }
      if (!guildQueue) {
        throw "Bot is not currently playing music";
      }
      if (msg.member.voice.channel.id !== guildQueue.voiceChannel.id) {
        throw "You're not in the same voice chat as bot";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: this.client.config.colors.error,
      });
    }
    this.client.player._leaveVC(msg.guild.id, "Stop Command");
  }
}

module.exports = Stop;
