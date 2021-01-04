import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Skip extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "skip",
      description: "Skips currently playing song",
      usage: "<prefix>skip",
      category: "Music",
    });
  }
  async run(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    const colors = this.client.config.colors;
    try {
      if (!msg.member.voice.channel) {
        throw "You have to be in a voice channel to skip songs!";
      }
      if (!guildQueue) {
        throw "There is no song that I could skip!";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.error,
      });
    }
    guildQueue.connection.dispatcher.end();
    guildQueue.isPlaying = false;
    outputEmbed(
      msg.channel,
      `Skipped **[${guildQueue.songs[0].title}](${guildQueue.songs[0].url})**`,
      {
        color: colors.success,
      }
    );
  }
}

module.exports = Skip;
