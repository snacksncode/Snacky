import Command from "../../base/Command";
import {
  Message,
  MessageReaction,
  CommandInterface,
  BotClient,
  Song,
  User,
  MessageEmbed,
} from "discord.js";
import { outputEmbed, paginateArray } from "../../utils/generic";
import formatSongLength from "../../utils/music/formatSongLength";
import getTotalLengthOfSongs from "../../utils/music/getTotalLengthOfSongs";

class Queue extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "queue",
      aliases: ["q", "songs"],
      description: "Shows current music queue",
      usage: "<prefix>queue [--page-size=<number>]",
      category: "Music",
    });
  }
  async run(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    const colors = this.client.config.colors;
    let songsPerPage = 5;
    const reactionCollectorIdleTimout = 60000;
    if (!guildQueue) {
      return outputEmbed(msg.channel, `Bot is not currently playing music`, {
        color: colors.warn,
      });
    } else if (guildQueue.songs.length === 0) {
      return outputEmbed(msg.channel, `Queue is empty`, {
        color: colors.info,
      });
    }
    const regex = /--page-size=(\d{1,})/g;
    const regexMatches = msg.content.matchAll(regex);
    const matchedCustomPageSize: string | undefined | null = regexMatches.next().value?.[1];
    if (matchedCustomPageSize) {
      const customPageSize = Number(matchedCustomPageSize);
      try {
        if (isNaN(customPageSize)) {
          throw "Invalid arguments passed to --page-size. You should only pass in numbers there.";
        }
        if (customPageSize > 20) {
          throw "You can output maximum of 20 songs per page.";
        }
        if (customPageSize <= 0) {
          throw "You cannot set the page size to 0 or less.";
        }
      } catch (errMsg) {
        return outputEmbed(msg.channel, errMsg, {
          color: colors.error,
          title: "",
        });
      }
      songsPerPage = customPageSize;
    }
    const filter = (reaction: MessageReaction, user: User) => {
      return ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && msg.author.id === user.id;
    };
    let currentPageIndex = 0;
    const queueEmbeds = this.generateQueueEmbeds(guildQueue.songs, songsPerPage);

    const messageObject = await msg.channel.send(queueEmbeds[currentPageIndex]);
    if (queueEmbeds.length > 1) {
      await messageObject.react("⬅️");
      await messageObject.react("⏹");
      await messageObject.react("➡️");
      const collectorInstance = messageObject.createReactionCollector(filter, {
        idle: reactionCollectorIdleTimout,
      });
      collectorInstance
        .on("collect", async (reaction: MessageReaction) => {
          switch (reaction.emoji.name) {
            case "⬅️": {
              currentPageIndex--;
              if (currentPageIndex < 0) {
                currentPageIndex = 0;
              }
              messageObject.edit(queueEmbeds[currentPageIndex]);
              break;
            }
            case "➡️": {
              currentPageIndex++;
              if (currentPageIndex >= queueEmbeds.length) {
                currentPageIndex = queueEmbeds.length - 1;
              }

              messageObject.edit(queueEmbeds[currentPageIndex]);
              break;
            }
            case "⏹": {
              messageObject.reactions.removeAll();
              collectorInstance.stop();
              break;
            }
          }
          await reaction.users.remove(msg.author.id);
        })
        .on("end", (_) => {
          messageObject.reactions.removeAll();
        });
    }
  }
  generateQueueEmbeds(songs: Song[], songsLimit: number): MessageEmbed[] {
    const queueEmbeds: MessageEmbed[] = [];
    const paginatedSongs: Song[][] = [];
    const amountOfPages: number = Math.ceil(songs.length / songsLimit);

    for (let pageNumber = 1; pageNumber <= amountOfPages; pageNumber++) {
      const arraySlice = paginateArray(songs, songsLimit, pageNumber);
      paginatedSongs.push(arraySlice);
    }

    for (let page of paginatedSongs) {
      const currentPage = paginatedSongs.indexOf(page) + 1;
      const pageEmbed = new MessageEmbed()
        .setTitle(`Music Queue`)
        .setColor(this.client.config.colors.info)
        .setDescription(this.generateQueuePageString(page, songs))
        .addFields([
          { name: "Number of tracks", value: songs.length, inline: true },
          {
            name: "Total length",
            value: formatSongLength(getTotalLengthOfSongs(songs)),
            inline: true,
          },
        ]);

      if (amountOfPages > 1) pageEmbed.setFooter(`Page: ${currentPage}/${amountOfPages}`);

      queueEmbeds.push(pageEmbed);
    }

    return queueEmbeds;
  }
  generateQueuePageString(page: Song[], songs: Song[]): string {
    let outputString: string = "";
    for (let song of page) {
      outputString += `${songs.indexOf(song) + 1}. [**${song.title}**](${song.url}) [${
        song.isLive ? "LIVE" : song.formattedLength
      }]\n`;
    }
    return outputString;
  }
}

module.exports = Queue;
