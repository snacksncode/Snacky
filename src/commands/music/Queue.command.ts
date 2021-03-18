import Command from "../../base/Command";
import {
  Message,
  MessageReaction,
  BotClient,
  Song,
  User,
  MessageEmbed,
  QueueCommandInterface,
  Collection,
  QueueMessageObject,
} from "discord.js";
import {
  getEmojiById,
  moveItemInArrayFromIndexToIndex,
  outputEmbed,
  paginateArray,
  removePrefix,
  sendMsg,
  swapElementsInArray,
} from "../../utils/generic";
import formatSongLength from "../../utils/music/formatSongLength";
import getTotalLengthOfSongs from "../../utils/music/getTotalLengthOfSongs";

class Queue extends Command implements QueueCommandInterface {
  queueMessages: Collection<string, QueueMessageObject>;
  generatedPages: Collection<string, MessageEmbed[]>;
  songsPerPage: number;
  constructor(client: BotClient) {
    super(client, {
      name: "queue",
      aliases: ["q", "songs"],
      description: "Shows current music queue",
      usage: "<prefix>queue [--edit] [--page-size=<number>]",
      category: "Music",
    });
    this.queueMessages = new Collection();
    this.generatedPages = new Collection();
    this.songsPerPage = 5;
  }
  async run(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    const colors = this.client.config.colors;
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
      this.client.config.ignoreUnknownCommands = true;
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
      const queueMessage = this.queueMessages.get(msg.author.id);
      const editQueueCommandsFilter = (m: Message) => {
        return (
          m.content.startsWith(this.client.config.prefix) && m.author.id === queueMessage.authorId
        );
      };
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
          this.client.config.ignoreUnknownCommands = false;
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
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    if (!guildQueue) return;
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
      songAIndex > guildQueue.songs.length - 1 ||
      songAIndex < 1 ||
      songBIndex > guildQueue.songs.length - 1 ||
      songBIndex < 1
    ) {
      outputEmbed(msg.channel, `Invalid position. Please check them again`, {
        color: colors.warn,
      });
      return;
    }
    guildQueue.songs = swapElementsInArray(guildQueue.songs, songAIndex, songBIndex);
    outputEmbed(
      msg.channel,
      `Successfully swapped **[${guildQueue.songs[songAIndex].title}](${guildQueue.songs[songAIndex].url})** and **[${guildQueue.songs[songBIndex].title}](${guildQueue.songs[songBIndex].url})**`,
      {
        color: colors.success,
      }
    );
    await this.updateRefQueueEmbed(msg);
  }

  async playSongNextInQueue(msg: Message, args: string[]) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    if (!guildQueue) return;
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
    } else if (songIndex > guildQueue.songs.length - 1 || songIndex < 1) {
      outputEmbed(msg.channel, `Invalid position. Please check it again`, {
        color: colors.warn,
      });
      return;
    }
    guildQueue.songs = moveItemInArrayFromIndexToIndex(guildQueue.songs, songIndex, 1);
    outputEmbed(
      msg.channel,
      `**[${guildQueue.songs[1].title}](${guildQueue.songs[1].url})** will play next`,
      {
        color: colors.success,
      }
    );
    await this.updateRefQueueEmbed(msg);
  }

  async moveSongInQueue(msg: Message, args: string[]) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    if (!guildQueue) return;
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
      moveFrom > guildQueue.songs.length - 1 ||
      moveFrom < 1 ||
      moveTo > guildQueue.songs.length - 1 ||
      moveTo < 1
    ) {
      outputEmbed(msg.channel, `Invalid position. Please check them again`, {
        color: colors.warn,
      });
      return;
    }
    guildQueue.songs = moveItemInArrayFromIndexToIndex(guildQueue.songs, moveFrom, moveTo);
    outputEmbed(
      msg.channel,
      `Moved **[${guildQueue.songs[moveTo].title}](${
        guildQueue.songs[moveTo].url
      })** to position **${moveTo + 1}**`,
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
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    const generatedPages = this.generateQueueEmbeds(
      msg.guild.id,
      guildQueue.songs,
      this.songsPerPage
    );
    const queueMessage = this.queueMessages.get(msg.author.id);
    //remove old reaction collector
    queueMessage?.collector?.stop();
    await queueMessage.ref.edit(generatedPages[0]);
    await this.attachCollectorToEmbed(msg.author.id, msg.guild.id);
    if (!pleaseWaitMessage.deleted) await pleaseWaitMessage.delete();
  }

  generateQueueEmbeds(guildId: string, songs: Song[], songsLimit: number): MessageEmbed[] {
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

    return this.generatedPages.set(guildId, queueEmbeds.slice()).get(guildId);
  }

  async attachCollectorToEmbed(authorId: string, guildId: string) {
    const queueMessage = this.queueMessages.get(authorId);
    const generatedPages = this.generatedPages.get(guildId);
    const reactionCollectorIdleTimout = 60000;
    let currentPageIndex = 0;

    const queueControlsFilter = (reaction: MessageReaction, user: User) => {
      return ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && authorId === user.id;
    };

    if (generatedPages.length > 1) {
      await queueMessage.ref.react("⬅️");
      await queueMessage.ref.react("⏹");
      await queueMessage.ref.react("➡️");
      const collectorInstance = queueMessage.ref.createReactionCollector(queueControlsFilter, {
        idle: reactionCollectorIdleTimout,
      });
      queueMessage.collector = collectorInstance;
      collectorInstance
        .on("collect", async (reaction: MessageReaction) => {
          switch (reaction.emoji.name) {
            case "⬅️": {
              currentPageIndex--;
              if (currentPageIndex < 0) {
                currentPageIndex = 0;
              }
              queueMessage.ref.edit(generatedPages[currentPageIndex]);
              break;
            }
            case "➡️": {
              currentPageIndex++;
              if (currentPageIndex >= generatedPages.length) {
                currentPageIndex = generatedPages.length - 1;
              }

              queueMessage.ref.edit(generatedPages[currentPageIndex]);
              break;
            }
            case "⏹": {
              queueMessage.ref.reactions.removeAll();
              collectorInstance.stop();
              break;
            }
          }
          await reaction.users.remove(authorId);
        })
        .on("end", (_) => {
          queueMessage.ref.reactions.removeAll();
        });
    }
  }

  async outputQueueEmbed(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    if (!guildQueue) return;
    const generatedPages = this.generateQueueEmbeds(
      msg.guild.id,
      guildQueue.songs,
      this.songsPerPage
    );
    const queueEmbedObject = this.queueMessages.get(msg.author.id);
    //if user already has embed, remove reaction collector on it
    if (queueEmbedObject) {
      queueEmbedObject?.collector?.stop();
    }
    const messageRef = await sendMsg(msg.channel, generatedPages[0]);
    const contructedQueueEmbedObject: QueueMessageObject = {
      ref: messageRef,
      authorId: msg.author.id,
      collector: null,
    };
    this.queueMessages.set(msg.author.id, contructedQueueEmbedObject);
    this.attachCollectorToEmbed(msg.author.id, msg.guild.id);
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
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    if (!guildQueue) return;
    const songToRemoveIndex = Number(args[0]) - 1;
    const maxIndex = guildQueue.songs.length - 1;
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
        const queueMessage = this.queueMessages.get(msg.author.id);
        const successEmoji = getEmojiById(reactionEmojis.success, this.client);
        const errorEmoji = getEmojiById(reactionEmojis.error, this.client);
        await messageObject.react(successEmoji);
        await messageObject.react(errorEmoji);
        const emojiAnswerFilter = (reaction: MessageReaction, user: User) => {
          return (
            [reactionEmojis.success, reactionEmojis.error].includes(reaction.emoji.id) &&
            queueMessage.authorId === user.id
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
                `Removed **[${guildQueue.songs[maxIndex].title}](${
                  guildQueue.songs[maxIndex].url
                })** at position **${maxIndex + 1}**`,
                {
                  color: colors.success,
                }
              );
              guildQueue.songs.splice(maxIndex, 1);
              this.updateRefQueueEmbed(msg);
              break;
            case reactionEmojis.error:
              outputEmbed(msg.channel, "Understood, cancelling the request", {
                color: colors.info,
              });
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
          `Removed **[${guildQueue.songs[songToRemoveIndex].title}](${
            guildQueue.songs[songToRemoveIndex].url
          })** at position **${songToRemoveIndex + 1}**`,
          {
            color: colors.success,
          }
        );
        guildQueue.songs.splice(songToRemoveIndex, 1);
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
