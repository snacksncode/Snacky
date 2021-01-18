import {
  Message,
  BotClient,
  MessageEmbed,
  MessageReaction,
  User,
  Song,
  Config,
  VoiceChannel,
  PlayCommandInterface,
} from "discord.js";
import ytpl from "ytpl";
import ytsr from "ytsr";
import Command from "../../base/Command";
import getSongFromLink from "../../utils/music/getSongFromLink";
import {
  moveItemInArrayFromIndexToIndex,
  outputEmbed,
  removePrefix,
  sendMsg,
  shuffleArray,
} from "../../utils/generic";

class Play extends Command implements PlayCommandInterface {
  colors: Config["colors"];
  constructor(client: BotClient) {
    super(client, {
      name: "play",
      aliases: ["p"],
      description: "Plays specified song",
      usage: `<prefix>play [YT Search | YT Video link | YT Playlist]`,
      category: "Music",
    });
    this.colors = this.client.config.colors;
  }

  async run(msg: Message) {
    //some validation so typescript isn't mad
    if (msg.channel.type !== "text") {
      return outputEmbed(msg.channel, `You're trying to use this command in wrong channel type.`, {
        color: this.colors.warn,
      });
    }
    //check if member is in voiceChat and if bot has permissions to join and speak
    const userVoiceChannel = msg.member.voice.channel;
    if (!userVoiceChannel) {
      return outputEmbed(msg.channel, `You need to be in a voice channel to play music`, {
        color: this.colors.warn,
      });
    }
    const permissions = userVoiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return outputEmbed(
        msg.channel,
        `Bot is missing permissions to speak and join voice channels`,
        {
          color: this.colors.error,
        }
      );
    }
    if (this.client.player.finishedQueueTimeoutId) {
      this.client.logger.log(
        { color: "warning", name: "Music Player: Debug" },
        "Added new song during timeout. Removing timeout..."
      );
      clearTimeout(this.client.player.finishedQueueTimeoutId);
    }
    //extract user input and create / read current guildQueue
    const userInput = removePrefix(msg.content, this.client.config.prefix);
    //check if message contains youtube url. If no assume it's a video title
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const containsUrl = !!msg.content.match(urlRegex);
    //check if message contains url
    if (!containsUrl) {
      // doens't contain url -> song title
      const titleRegex = /\b\w*\s(.*\s?)/g;
      const inputMatchArray = userInput.matchAll(titleRegex).next();
      //Get first group of matched string. Null oparators used to prevent crash if there's no match
      const extractedMatch: string | null = inputMatchArray.value?.[1];
      if (!extractedMatch) {
        return outputEmbed(msg.channel, `You didn't provide song title`, {
          color: this.colors.warn,
        });
      }
      const requestedSongTitle = extractedMatch.replace(/\s+/g, " ").trim();
      try {
        outputEmbed(msg.channel, `Be right back :3 | Seaching on YouTube...`, {
          color: this.colors.info,
        });
        try {
          let ytSearchResults = await ytsr(requestedSongTitle, { pages: 1 });
          let filteredResult = ytSearchResults.items.filter((item) => item.type === "video")?.[0];
          //type checking just for TS to be happy
          if (!filteredResult || filteredResult.type !== "video") {
            return outputEmbed(msg.channel, `Search returned an empty result`, {
              color: this.colors.warn,
            });
          }
          this.processSong(filteredResult.url, msg);
        } catch (err) {
          console.log(err.message);
          return outputEmbed(
            msg.channel,
            `Hmm... There was an error whilst searching for the song on YouTube. Try again later?`,
            {
              color: this.colors.error,
            }
          );
        }
      } catch (err) {
        return outputEmbed(msg.channel, "Failed to get song from youtube. Try again?", {
          color: this.colors.error,
        });
      }
    } else {
      // Contains URL
      const extractedUrl = msg.content.match(urlRegex).shift();
      if (!extractedUrl.includes("youtube.com") && !extractedUrl.includes("youtu.be")) {
        //if user typed a url that is not a youtube url
        return outputEmbed(msg.channel, `The url you've provided is not a valid youtube url`, {
          color: this.colors.warn,
        });
      } else if (extractedUrl.includes("youtu.be")) {
        return outputEmbed(msg.channel, `Sorry but **youtu.be** links are not supported`, {
          color: this.colors.warn,
        });
      }
      try {
        const containsListFlag = !!extractedUrl.match(/list=.*/);
        const containsWatchFlag = !!extractedUrl.match(/watch\?v=.*/);

        if (!containsWatchFlag && !containsListFlag) {
          //list don't have list? or watch?v flags. | NONE
          return outputEmbed(
            msg.channel,
            `I cannot find the video id in this link. Could you please give me a link like this one: \`https://www.youtube.com/watch?v=-vJ0NMOH2vA\`?`,
            {
              color: this.colors.error,
            }
          );
        } else if (!containsListFlag && containsWatchFlag) {
          //link contains only watch?v=<id> flag | SONG
          this.processSong(extractedUrl, msg);
        } else if (containsListFlag && !containsWatchFlag) {
          //link contains only list=<id> flag | PLAYLIST
          this.processPlaylist(extractedUrl, msg, false, false);
        } else if (containsWatchFlag && containsListFlag) {
          //link contains watch flag as well as playlist | LET USER CHOOSE
          const playlistId = await ytpl.getPlaylistID(extractedUrl);
          const validPlayListId = ytpl.validateID(playlistId);
          if (!validPlayListId) {
            return outputEmbed(msg.channel, `This is not a valid playlist`, {
              color: this.colors.error,
            });
          }
          let chooseEmbed = new MessageEmbed()
            .setTitle("Please choose what you want to do")
            .setDescription(
              "I've detected that your link contains playlist and song id's. Please choose what you want to do."
            )
            .addFields([
              {
                name: "1. Play the song",
                value:
                  "Bot will ignore the playlist provided and will just add provided song to queue",
              },
              {
                name: "2. Add playlist to queue",
                value:
                  "Bot will add the whole playlist provided playlist to queue and will play the songs in the order of how they are in playlist.",
              },
              {
                name: "3. Add playlist to queue but play provided song first",
                value:
                  "Bot will add the whole provided playlist to queue but will put the song at the beggining of that playlist",
              },
            ])
            .setColor(this.colors.info);
          const messageObject = await sendMsg(msg.channel, chooseEmbed);
          await messageObject.react("1️⃣");
          await messageObject.react("2️⃣");
          await messageObject.react("3️⃣");
          const filterFunction = (reaction: MessageReaction, user: User) => {
            return ["1️⃣", "2️⃣", "3️⃣"].includes(reaction.emoji.name) && msg.author.id === user.id;
          };
          const collectorInstance = messageObject.createReactionCollector(filterFunction, {
            max: 1,
            idle: 30000, //30s, I think...
          });
          let userInputReceived = false;
          let userSelectedOptionText = "";
          collectorInstance
            .on("collect", async (reaction: MessageReaction) => {
              userInputReceived = true;
              switch (reaction.emoji.name) {
                case "1️⃣": {
                  //Just play the song, ignore playlist
                  this.processSong(extractedUrl, msg);
                  userSelectedOptionText = "You have chosen 1st option";
                  collectorInstance.stop();
                  break;
                }
                case "2️⃣": {
                  //Add the playlist to queue
                  this.processPlaylist(extractedUrl, msg, false, false);
                  userSelectedOptionText = "You have chosen 2nd option";
                  collectorInstance.stop();
                  break;
                }
                case "3️⃣": {
                  //Add the playlist to queue
                  this.processPlaylist(extractedUrl, msg, true, false);
                  userSelectedOptionText = "You have chosen 3rd option";
                  collectorInstance.stop();
                  break;
                }
              }
            })
            .on("end", async (_) => {
              messageObject.reactions.removeAll();
              chooseEmbed.setFooter(userSelectedOptionText);
              messageObject.edit(chooseEmbed);
              //if no reaction were collected output message
              if (!userInputReceived) {
                outputEmbed(msg.channel, `No input from user provided. Cancelling the request.`, {
                  color: this.colors.warn,
                });
              }
            });
        }
      } catch (_) {
        return outputEmbed(
          msg.channel,
          `Failed to add the song to queue or parse it's info. Try again?`,
          {
            color: this.colors.error,
          }
        );
      }
    }
  }

  async processSong(url: string, msg: Message) {
    let songsToAddToQueue: Song[] = [];
    const userVoiceChannel = msg.member.voice.channel;
    const song = await getSongFromLink(url, msg);
    songsToAddToQueue.push(song);
    this.updateQueueAndJoinVC(msg, songsToAddToQueue, userVoiceChannel);
  }

  async processPlaylist(
    url: string,
    msg: Message,
    putSongAsFirst: boolean,
    randomizePlaylist: boolean
  ) {
    const songsToLoad: Promise<Song>[] = [];
    const playlistId = await ytpl.getPlaylistID(url);
    const validPlayListId = ytpl.validateID(playlistId);
    if (!validPlayListId) {
      outputEmbed(msg.channel, `This is not a valid playlist`, {
        color: this.colors.error,
      });
      return;
    }
    const userVoiceChannel = msg.member.voice.channel;
    ytpl(playlistId)
      .then(async (playlist) => {
        outputEmbed(
          msg.channel,
          `Loading **${playlist.items.length}** songs from playlist **[${playlist.title}](${playlist.url})**`,
          {
            color: this.colors.info,
          }
        );
        //loop through songs
        for (let playlistSong of playlist.items) {
          const loadSong = getSongFromLink(playlistSong.url, msg);
          songsToLoad.push(loadSong);
        }
        let loadedSongs = await Promise.all(songsToLoad);
        if (randomizePlaylist) {
          loadedSongs = shuffleArray(loadedSongs);
        }
        if (putSongAsFirst) {
          const matchedSongIDFromURL = url.matchAll(/\?v=(.*)\&list/g).next()?.value?.[1];
          let songIndex: number = -1;
          for (let song of loadedSongs) {
            if (song.id === matchedSongIDFromURL) {
              songIndex = loadedSongs.indexOf(song);
            }
          }
          if (songIndex === -1) {
            outputEmbed(msg.channel, `Something went wrong during song index detection process`, {
              color: this.client.config.colors.error,
            });
            return;
          }
          loadedSongs = moveItemInArrayFromIndexToIndex(loadedSongs, songIndex, 0);
        }
        this.updateQueueAndJoinVC(msg, loadedSongs, userVoiceChannel, playlist.title);
      })
      .catch((_) => {
        outputEmbed(
          msg.channel,
          `I was't able to parse that playlist. Please recheck that it's public and the ID is right`,
          {
            color: this.colors.error,
          }
        );
        return;
      });
  }

  async updateQueueAndJoinVC(
    msg: Message,
    songsToAdd: Song[],
    userVoiceChannel: VoiceChannel,
    playlistName?: string
  ) {
    if (msg.channel.type !== "text") return; //make typescript happy

    let guildQueue = this.client.player.getQueue(msg.guild.id);
    let invokeNewDispatcher = false;
    if (!guildQueue) {
      //initialize the queue object
      guildQueue = this.client.player.createQueue(msg.guild.id);
      //setup textChannel and voiceChannel on guildQueue
      guildQueue.textChannel = msg.channel;
      guildQueue.voiceChannel = userVoiceChannel;
      invokeNewDispatcher = true;
    }
    //add the songs to the songs queue
    songsToAdd.forEach((song) => {
      guildQueue.songs.push(song);
    });
    //check the length of songsToAddToQueue and output different embeds based on the length
    let embedMessage: string = "";
    //playlistName variable won't be undefined only if I'm processing a playlist
    if (playlistName) {
      embedMessage = `Added **${songsToAdd.length}** songs to queue from **${playlistName}**`;
    } else {
      embedMessage = `Added **[${songsToAdd[0].title}](${songsToAdd[0].url})** to queue`;
    }
    //let user know what we how much songs we added or if it's only one it's name
    outputEmbed(msg.channel, embedMessage, {
      color: this.colors.info,
    });
    if (invokeNewDispatcher) {
      //try joining voiceChannel
      try {
        var connection = await userVoiceChannel.join();
        guildQueue.connection = connection;
        await guildQueue.connection.voice.setSelfDeaf(true);
      } catch (err) {
        // Printing the error message if the bot fails to join the voicechat
        console.log(err);
        this.client.player.guildsQueue.delete(msg.guild.id);
        await outputEmbed(
          msg.channel,
          `Bot failed to establish connection within 15 seconds. Bot will now try to leave voicechat and then you can try again.`,
          {
            color: this.colors.error,
            title: "Error",
          }
        );
        this.client.guilds.cache.get(msg.guild.id).me.voice?.channel?.leave(); //try leaving voice chat | null operators to prevent crashing
      }
    }
    if (!guildQueue.isPlaying) {
      this.client.player.playSong(msg, guildQueue.songs[0]);
    }
  }
}

module.exports = Play;
