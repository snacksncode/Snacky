import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";
import formatSongLength from "../../utils/music/formatSongLength";
import progressBar from "../../utils/progressBar";

class NowPlaying extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "nowplaying",
      aliases: ["np", "playing"],
      description: "Shows currently playing song as well as some info about it",
      usage: "<prefix>nowplaying",
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
      if (guildQueue.songs.length === 0) {
        throw "Currently queue is empty";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    //get currently playing song and fetch some info about it
    const song = guildQueue.songs[0]; //get song at first position in queue
    const songDispatcher = guildQueue.connection.dispatcher;
    const amountOfSecondsPlayed = Math.floor(songDispatcher.streamTime / 1000);
    const songLength = song.length;
    const progress = progressBar({
      current: amountOfSecondsPlayed,
      emptyChar: "-",
      filledChar: "=",
      limit: songLength,
      width: 35,
    });
    outputEmbed(
      msg.channel,
      `**[${song.title}](${song.url})**\n${progress} ${formatSongLength(amountOfSecondsPlayed)}/${
        song.formattedLength
      }`,
      {
        color: this.client.config.colors.info,
        title: "Currently playing",
      }
    );
  }
}

module.exports = NowPlaying;
