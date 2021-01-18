import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed, shuffleArray } from "../../utils/generic";

class KebabikPls extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "shuffle",
      description: "Randomizes current queue (excluding first song)",
      usage: "<prefix>shuffle",
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
        throw "You're not in the same voice chat as Snacky";
      }
      if (guildQueue.songs.length === 0) {
        throw "Nothing to shuffle. Queue is empty";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    //shuffle the queue excluding first song
    const firstSongObject = guildQueue.songs[0];
    const restOfTheQueue = guildQueue.songs.slice(1); //basically rest of the array
    const shuffledQueue = shuffleArray(restOfTheQueue);
    shuffledQueue.unshift(firstSongObject);
    guildQueue.songs = shuffledQueue;
    outputEmbed(msg.channel, `Queue has been successfully shuffled`, {
      color: colors.success,
    });
  }
}

module.exports = KebabikPls;
