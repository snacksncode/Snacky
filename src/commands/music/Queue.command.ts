import Command from "../../base/Command";
import {
  Message,
  MessageReaction,
  BotClient,
  Song,
  User,
  MessageEmbed,
  GuildMusicQueue,
  QueueCommandInterface,
  QueueMessageData,
} from "discord.js";
import {
  getEmojiById,
  moveItemInArrayFromIndexToIndex,
  outputEmbed,
  paginateArray,
  removePrefix,
  swapElementsInArray,
} from "../../utils/generic";
import formatSongLength from "../../utils/music/formatSongLength";
import getTotalLengthOfSongs from "../../utils/music/getTotalLengthOfSongs";

class Queue extends Command implements QueueCommandInterface {
  queueMessage: QueueMessageData;
  guildQueue: GuildMusicQueue;
  songsPerPage: number;
  constructor(client: BotClient) {
    super(client, {
      name: "queue",
      aliases: ["q", "songs"],
      description: "Shows current music queue",
      usage: "<prefix>queue [--edit] [--page-size=<number>]",
      category: "Music",
    });
    this.queueMessage = {
      ref: null,
      collector: null,
      generatedPages: null,
      authorId: null,
    };
    this.songsPerPage = 5;
  }
  async run(msg: Message) {
    this.guildQueue = this.client.player.getQueue(msg.guild.id);
    const colors = this.client.config.colors;
    if (!this.guildQueue) {
      return outputEmbed(msg.channel, `Bot is not currently playing music`, {
        color: colors.warn,
      });
    } else if (this.guildQueue.songs.length === 0) {
      return outputEmbed(msg.channel, `Queue is empty`, {
        color: colors.info,
      });
    }
    const regex = /--page-size=(\d{1,})/g;
    const regexMatches = msg.content.matchAll(regex);
    const matchedCustomPageSize: string | undefined | null = regexMatches.next().value?.[1];
    const queueEditMode = !!msg.content.match(/--(edit|settings|options)/g)?.shift();
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
      this.songsPerPage = customPageSize;
    }

    if (queueEditMode) {
      this.client.player.queueEditMode = true;
      //some fancy output
      await outputEmbed(
        msg.channel,
        "You can now edit your queue\nYou can delete and move songs around. When you're done just type `s!exit`",
        {
          color: colors.info,
          title: "You've entered queue edit mode",
          fields: [
            {
              name: "Removing",
              value: "Use `s!remove <position>` to remove song at that position",
            },
            {
              name: "Moving",
              value: "Use `s!move <from> <to>` to move a song from position to another position",
            },
            {
              name: "Swapping",
              value: "Use `s!swap <song1> <song2>` to swap positions of two songs",
            },
            {
              name: "Play next",
              value: "Use `s!next <position>` to play that song after currently playing one",
            },
          ],
        }
      );
      await this.outputQueueEmbed(msg);
      this.queueMessage.authorId = msg.author.id;
      const editQueueCommandsFilter = (m: Message) =>
        m.content.startsWith(this.client.config.prefix) &&
        m.author.id === this.queueMessage.authorId;
      const timeLimit = 5 * 60 * 1000; //5min
      const collector = msg.channel.createMessageCollector(editQueueCommandsFilter, {
        time: timeLimit,
      });
      collector
        .on("collect", async (m: Message) => {
          const userInput = removePrefix(m.content.trim(), this.client.config.prefix);
          const args = userInput.split(" ");
          const command = args.shift().toLowerCase();
          switch (command) {
            case "remove":
              await this.removeSongFromQueue(msg, args);
              break;
            case "move":
              await this.moveSongInQueue(msg, args);
              break;
            case "swap":
              await this.swapSongsInQueue(msg, args);
              break;
            case "next":
              await this.playSongNextInQueue(msg, args);
              break;
            case "exit":
              collector.stop();
              return;
            default:
              break;
          }
        })
        .on("end", (collected) => {
          this.client.player.queueEditMode = false;
          let exitString = "Exiting queue edit mode";
          if (collected.size < 1) {
            exitString = "Exiting queue edit mode due to inactivity";
          }
          outputEmbed(msg.channel, exitString, {
            color: colors.info,
          });
        });
    } else {
      await this.outputQueueEmbed(msg);
    }
  }

  async swapSongsInQueue(msg: Message, args: string[]) {
    let songs = this.guildQueue.songs;
    const songAIndex = Number(args[0]) - 1;
    const songBIndex = Number(args[1]) - 1;
    const colors = this.client.config.colors;
    if (Number.isNaN(songAIndex) || Number.isNaN(songBIndex)) {
      outputEmbed(
        msg.channel,
        `Invalid argument. It should be a number, specifically the number next to the song that you want to remove`,
        {
          color: colors.warn,
        }
      );
      return;
    } else if (
      songAIndex > songs.length - 1 ||
      songAIndex < 1 ||
      songBIndex > songs.length - 1 ||
      songBIndex < 1
    ) {
      outputEmbed(msg.channel, `Invalid position. Please check them again`, {
        color: colors.warn,
      });
      return;
    }
    this.guildQueue.songs = swapElementsInArray(songs, songAIndex, songBIndex);
    outputEmbed(
      msg.channel,
      `Successfully swapped **[${songs[songAIndex].title}](${songs[songAIndex].url})** and **[${songs[songBIndex].title}](${songs[songBIndex].url})**`,
      {
        color: colors.success,
      }
    );
    await this.updateRefQueueEmbed(msg);
  }

  async playSongNextInQueue(msg: Message, args: string[]) {
    let songs = this.guildQueue.songs;
    const songIndex = Number(args[0]) - 1;
    const colors = this.client.config.colors;
    if (Number.isNaN(songIndex)) {
      outputEmbed(
        msg.channel,
        `Invalid argument. It should be a number, specifically the number next to the song that you want to remove`,
        {
          color: colors.warn,
        }
      );
      return;
    } else if (songIndex > songs.length - 1 || songIndex < 1) {
      outputEmbed(msg.channel, `Invalid position. Please check it again`, {
        color: colors.warn,
      });
      return;
    }
    this.guildQueue.songs = moveItemInArrayFromIndexToIndex(songs, songIndex, 1);
    outputEmbed(
      msg.channel,
      `**[${songs[songIndex].title}](${songs[songIndex].url})** will play next`,
      {
        color: colors.success,
      }
    );
    await this.updateRefQueueEmbed(msg);
  }

  async moveSongInQueue(msg: Message, args: string[]) {
    let songs = this.guildQueue.songs;
    const moveFrom = Number(args[0]) - 1;
    const moveTo = Number(args[1]) - 1;
    const colors = this.client.config.colors;
    if (Number.isNaN(moveFrom) || Number.isNaN(moveTo)) {
      outputEmbed(
        msg.channel,
        `Invalid argument. It should be a number, specifically the number next to the song that you want to remove`,
        {
          color: colors.warn,
        }
      );
      return;
    } else if (
      moveFrom > songs.length - 1 ||
      moveFrom < 1 ||
      moveTo > songs.length - 1 ||
      moveTo < 1
    ) {
      outputEmbed(msg.channel, `Invalid position. Please check them again`, {
        color: colors.warn,
      });
      return;
    }
    this.guildQueue.songs = moveItemInArrayFromIndexToIndex(songs, moveFrom, moveTo);
    outputEmbed(
      msg.channel,
      `Moved **[${songs[moveFrom].title}](${songs[moveFrom].url})** to position **${moveTo + 1}**`,
      {
        color: colors.success,
      }
    );
    await this.updateRefQueueEmbed(msg);
  }

  async updateRefQueueEmbed(msg: Message) {
    const [pleaseWaitMessage] = await outputEmbed(msg.channel, "", {
      color: this.client.config.colors.info,
      title: "Updating some stuff... Please wait",
    });
    this.generateQueueEmbeds(this.guildQueue.songs, this.songsPerPage);
    //remove old reaction collector
    this.queueMessage.collector?.stop();
    await this.queueMessage.ref.edit(this.queueMessage.generatedPages[0]);
    await this.attachCollectorToEmbed(this.queueMessage.ref);
    if (!pleaseWaitMessage.deleted) await pleaseWaitMessage.delete();
  }

  generateQueueEmbeds(songs: Song[], songsLimit: number) {
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

      if (amountOfPages > 1) pageEmbed.setFooter(`Page ${currentPage}/${amountOfPages}`);

      queueEmbeds.push(pageEmbed);
    }

    this.queueMessage.generatedPages = queueEmbeds.slice();
  }

  async attachCollectorToEmbed(queueMessageRef: Message) {
    const reactionCollectorIdleTimout = 60000;
    let currentPageIndex = 0;

    const queueControlsFilter = (reaction: MessageReaction, user: User) => {
      return (
        ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && this.queueMessage.authorId === user.id
      );
    };

    if (this.queueMessage.generatedPages.length > 1) {
      await queueMessageRef.react("⬅️");
      await queueMessageRef.react("⏹");
      await queueMessageRef.react("➡️");
      const collectorInstance = queueMessageRef.createReactionCollector(queueControlsFilter, {
        idle: reactionCollectorIdleTimout,
      });
      this.queueMessage.collector = collectorInstance;
      collectorInstance
        .on("collect", async (reaction: MessageReaction) => {
          switch (reaction.emoji.name) {
            case "⬅️": {
              currentPageIndex--;
              if (currentPageIndex < 0) {
                currentPageIndex = 0;
              }
              queueMessageRef.edit(this.queueMessage.generatedPages[currentPageIndex]);
              break;
            }
            case "➡️": {
              currentPageIndex++;
              if (currentPageIndex >= this.queueMessage.generatedPages.length) {
                currentPageIndex = this.queueMessage.generatedPages.length - 1;
              }

              this.queueMessage.ref.edit(this.queueMessage.generatedPages[currentPageIndex]);
              break;
            }
            case "⏹": {
              this.queueMessage.ref.reactions.removeAll();
              collectorInstance.stop();
              break;
            }
          }
          await reaction.users.remove(this.queueMessage.authorId);
        })
        .on("end", (_) => {
          this.queueMessage.ref.reactions.removeAll();
        });
    }
  }

  async outputQueueEmbed(msg: Message) {
    this.generateQueueEmbeds(this.guildQueue.songs, this.songsPerPage);
    this.queueMessage.ref = await msg.channel.send(this.queueMessage.generatedPages[0]);
    this.attachCollectorToEmbed(this.queueMessage.ref);
  }

  generateQueuePageString(page: Song[], songs: Song[]): string {
    let outputString: string = "";
    for (let song of page) {
      outputString += `${songs.indexOf(song) + 1}. **[${song.title}](${song.url})** [${
        song.isLive ? "LIVE" : song.formattedLength
      }]\n`;
    }
    return outputString;
  }

  async removeSongFromQueue(msg: Message, args: string[]) {
    const songs = this.guildQueue.songs;
    const songToRemoveIndex = Number(args[0]) - 1;
    const maxIndex = songs.length - 1;
    const colors = this.client.config.colors;
    const minIndex = 0;
    if (Number.isNaN(songToRemoveIndex)) {
      outputEmbed(
        msg.channel,
        `Invalid argument. It should be a number, specifically the number next to the song that you want to remove`,
        {
          color: colors.warn,
        }
      );
      return;
    }
    try {
      if (songToRemoveIndex > maxIndex) {
        const [messageObject] = await outputEmbed(
          msg.channel,
          `The provided song index is greater than amount of songs in queue. Do you want me to remove last song?`,
          {
            color: colors.warn,
          }
        );
        const reactionEmojis = this.client.config.reactionEmojis;
        const successEmoji = getEmojiById(reactionEmojis.success, this.client);
        const errorEmoji = getEmojiById(reactionEmojis.error, this.client);
        await messageObject.react(successEmoji);
        await messageObject.react(errorEmoji);
        const emojiAnswerFilter = (reaction: MessageReaction, user: User) => {
          return (
            [reactionEmojis.success, reactionEmojis.error].includes(reaction.emoji.id) &&
            this.queueMessage.authorId === user.id
          );
        };
        const collectorInstance = messageObject.createReactionCollector(emojiAnswerFilter, {
          idle: 30000, //30s
          max: 1,
        });
        collectorInstance.on("collect", async (reaction: MessageReaction) => {
          switch (reaction.emoji.id) {
            case reactionEmojis.success:
              outputEmbed(
                msg.channel,
                `Removed **[${songs[maxIndex].title}](${songs[maxIndex].url})** at position **${
                  maxIndex + 1
                }**`,
                {
                  color: colors.success,
                }
              );
              songs.splice(maxIndex, 1);
              this.updateRefQueueEmbed(msg);
              break;
            case reactionEmojis.error:
              outputEmbed(msg.channel, "Understood, cancelling the request", {
                color: colors.info,
              });
              break;
            default:
              break;
          }
        });
      } else if (songToRemoveIndex < minIndex) {
        await outputEmbed(
          msg.channel,
          `The provided song index is less-than one. Songs start at position 1, you know?`,
          {
            color: colors.warn,
          }
        );
      } else {
        outputEmbed(
          msg.channel,
          `Removed **[${songs[songToRemoveIndex].title}](${
            songs[songToRemoveIndex].url
          })** at position **${songToRemoveIndex + 1}**`,
          {
            color: colors.success,
          }
        );
        songs.splice(songToRemoveIndex, 1);
        this.updateRefQueueEmbed(msg);
      }
    } catch {
      outputEmbed(msg.channel, `There was an error whilst removing a song. Try again?`, {
        color: colors.error,
      });
    }
  }
}

module.exports = Queue;
