import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Earrape extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "loop",
      description:
        "Toggles looping of currently playing song | Will later support looping of whole queue",
      usage: "<prefix>loop",
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
      if (guildQueue.songs.length === 0) {
        throw "Queue is empty";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    //toggle the value on current player
    guildQueue.loopMode = guildQueue.loopMode === "song" ? "off" : "song";
    outputEmbed(
      msg.channel,
      guildQueue.loopMode === "song"
        ? `**[${guildQueue.songs[0].title}](${guildQueue.songs[0].url})** will now loop`
        : `Looping is disabled`,
      {
        color: colors.info,
      }
    );
  }
}

module.exports = Earrape;
