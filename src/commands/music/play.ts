import { Message, MessageEmbed, MessageReaction, Song, User, VoiceChannel } from "discord.js";

import { createQueue, getQueue } from "../../utils/music/queueManager";
import removePrefix from "../../utils/removePrefix";
import playSong from "../../utils/music/playSong";
import outputEmbed from "../../utils/outputEmbed";
import { colors, ownerId } from "../../config";
import ytpl from "ytpl";
import ytsr from "ytsr";
import sendMsg from "../../utils/sendMsg";
import getSongFromLink from "../../utils/music/getSongFromLink";

async function playCommand(msg: Message) {
  //some validation so typescript isn't mad
  if (msg.channel.type !== "text") {
    return outputEmbed(msg.channel, `You're trying to use this command in wrong channel type.`, {
      color: colors.warn,
      title: "",
    });
  }
  //check if member is in voiceChat and if bot has permissions to join and speak
  const userVoiceChannel = msg.member.voice.channel;
  if (!userVoiceChannel) {
    return outputEmbed(msg.channel, `You need to be in a voice channel to play music`, {
      color: colors.warn,
      title: "",
    });
  }
  const permissions = userVoiceChannel.permissionsFor(msg.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return outputEmbed(msg.channel, `Bot is missing permissions to speak and join voice channels`, {
      color: colors.error,
      title: "",
    });
  }
  //extract user input and create / read current guildQueue
  const userInput = removePrefix(msg.content);
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
        color: colors.warn,
        title: "",
      });
    }
    const requestedSongTitle = extractedMatch.replace(/\s+/g, " ").trim();
    try {
      outputEmbed(msg.channel, `Be right back :3 | Seaching on YouTube...`, {
        color: colors.info,
        title: "",
      });
      try {
        let ytSearchResults = await ytsr(requestedSongTitle, { pages: 1 });
        let filteredResult = ytSearchResults.items.filter((item) => item.type === "video")?.[0];
        //type checking just for TS to be happy
        if (!filteredResult || filteredResult.type !== "video") {
          return outputEmbed(msg.channel, `Search returned an empty result`, {
            color: colors.warn,
            title: "",
          });
        }
        processSong(filteredResult.url, msg);
      } catch (err) {
        return outputEmbed(
          msg.channel,
          `Hmm... There was an error whilst searching for the song on YouTube. Try again later?`,
          {
            color: colors.error,
            title: "",
          }
        );
        console.log(err.message);
      }
    } catch (err) {
      return outputEmbed(msg.channel, "Failed to get song from youtube. Try again?", {
        color: colors.error,
        title: "",
      });
    }
  } else {
    // Contains URL
    const extractedUrl = msg.content.match(urlRegex).shift();
    if (!extractedUrl.includes("youtube.com")) {
      //if user typed a url that is not a youtube url
      return outputEmbed(msg.channel, `The url you've provided is not a valid youtube url`, {
        color: colors.warn,
        title: "",
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
            color: colors.error,
            title: "",
          }
        );
      } else if (!containsListFlag && containsWatchFlag) {
        //link contains only watch?v=<id> flag | SONG
        processSong(extractedUrl, msg);
      } else if (containsListFlag && !containsWatchFlag) {
        //link contains only list=<id> flag | PLAYLIST
        processPlaylist(extractedUrl, msg);
      } else if (containsWatchFlag && containsListFlag) {
        //link contains watch flag as well as playlist | LET USER CHOOSE
        const playlistId = await ytpl.getPlaylistID(extractedUrl);
        const validPlayListId = ytpl.validateID(playlistId);
        if (!validPlayListId) {
          return outputEmbed(msg.channel, `This is not a valid playlist`, {
            color: colors.error,
            title: "",
          });
        }
        let chooseEmbed = new MessageEmbed()
          .setTitle("Please choose what you want to do")
          .setDescription(
            "I've detected that your link contains playlist and song id's. Please choose what you want to do."
          )
          .addFields([
            {
              name: "1. Just play the song",
              value:
                "Bot will ignore the playlist provided and will just add provided song to queue",
            },
            {
              name: "2. Just add playlist to queue",
              value:
                "Bot will add the whole playlist provided playlist to queue and will play the songs in the order of how they are in playlist.",
            },
            {
              name: "3. Add playlist to queue but play provided song first",
              value:
                "Bot will add the whole provided playlist to queue but will put the song at the beggining of that playlist",
            },
          ])
          .setColor(colors.info);
        const messageObject = await sendMsg(msg.channel, chooseEmbed);
        await messageObject.react("1️⃣");
        await messageObject.react("2️⃣");
        await messageObject.react("3️⃣");
        const filterFunction = (reaction: MessageReaction, user: User) => {
          return ["1️⃣", "2️⃣", "3️⃣"].includes(reaction.emoji.name) && msg.author.id === user.id;
        };
        const collectorInstance = messageObject.createReactionCollector(filterFunction, {
          max: 1,
          idle: 30000, //30s, I think lmao
        });
        let userInputReceived = false;
        let userSelectedOptionText = "";
        collectorInstance
          .on("collect", async (reaction: MessageReaction) => {
            userInputReceived = true;
            switch (reaction.emoji.name) {
              case "1️⃣": {
                //Just play the song, ignore playlist
                processSong(extractedUrl, msg);
                userSelectedOptionText = "You have chosen 1st option";
                collectorInstance.stop();
                break;
              }
              case "2️⃣": {
                //Add the playlist to queue
                processPlaylist(extractedUrl, msg);
                userSelectedOptionText = "You have chosen 2nd option";
                collectorInstance.stop();
                break;
              }
              case "3️⃣": {
                //Add the playlist to queue
                userSelectedOptionText = "You have chosen 3rd option";
                outputEmbed(
                  msg.channel,
                  `<@${ownerId}> sucks ass lmao.\nOption 3 is not yet developed`,
                  {
                    color: colors.warn,
                    title: "",
                  }
                );
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
                title: "",
                color: colors.warn,
              });
            }
          });
      }
    } catch (_) {
      return outputEmbed(
        msg.channel,
        `Failed to add the song to queue or parse it's info. Try again?`,
        {
          title: "",
          color: colors.error,
        }
      );
    }
  }
}

//get the song info from link and add it songsToAddQueue
async function processSong(url: string, msg: Message) {
  let songsToAddToQueue: Song[] = [];
  const userVoiceChannel = msg.member.voice.channel;
  const song = await getSongFromLink(url, msg);
  songsToAddToQueue.push(song);
  updateGuildQueueAndJoinVC(msg, songsToAddToQueue, userVoiceChannel);
}

//get songs from playlist and add it songsToAddQueue. Also show loading progress
async function processPlaylist(url: string, msg: Message) {
  const songsToLoad: Promise<Song>[] = [];
  const playlistId = await ytpl.getPlaylistID(url);
  const validPlayListId = ytpl.validateID(playlistId);
  if (!validPlayListId) {
    return outputEmbed(msg.channel, `This is not a valid playlist`, {
      color: colors.error,
      title: "",
    });
  }
  const userVoiceChannel = msg.member.voice.channel;
  ytpl(playlistId)
    .then(async (playlist) => {
      outputEmbed(
        msg.channel,
        `Loading **${playlist.items.length}** songs from playlist **[${playlist.title}](${playlist.url})**`,
        {
          title: "",
          color: colors.info,
        }
      );
      //loop through songs
      for (let playlistSong of playlist.items) {
        const loadSong = getSongFromLink(playlistSong.url, msg);
        songsToLoad.push(loadSong);
      }
      const loadedSongs = await Promise.all(songsToLoad);
      updateGuildQueueAndJoinVC(msg, loadedSongs, userVoiceChannel, playlist.title);
    })
    .catch((_) => {
      return outputEmbed(
        msg.channel,
        `I was't able to parse that playlist. Please recheck that it's public and the ID is right`,
        {
          title: "",
          color: colors.error,
        }
      );
    });
}

async function updateGuildQueueAndJoinVC(
  msg: Message,
  songsToAdd: Song[],
  userVoiceChannel: VoiceChannel,
  _playlistName?: string
) {
  if (msg.channel.type !== "text") return; //make typescript happy;
  let playlistName = _playlistName ? _playlistName : undefined;
  let guildQueue = getQueue(msg.guild.id, msg.client);
  let invokeNewDispatcher = false;
  if (!guildQueue) {
    //initialize the queue object
    guildQueue = createQueue(msg.guild.id, msg.client);
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
    embedMessage = `Added **${songsToAdd.length}** songs to queue from ${playlistName}`;
  } else {
    embedMessage = `Added [**${songsToAdd[0].title}**](${songsToAdd[0].url}) to queue`;
  }
  //let user know what we how much songs we added or if it's only one it's name
  outputEmbed(msg.channel, embedMessage, {
    title: "",
    color: colors.info,
  });
  if (invokeNewDispatcher) {
    //try joining voiceChannel
    try {
      var connection = await userVoiceChannel.join();
      guildQueue.connection = connection;
      await guildQueue.connection.voice.setSelfDeaf(true);
      playSong(msg, guildQueue.songs[0]);
    } catch (err) {
      // Printing the error message if the bot fails to join the voicechat
      console.log(err);
      msg.client.guildsQueue.delete(msg.guild.id);
      return outputEmbed(
        msg.channel,
        `Bot failed to join voicechat. Probable cause: missing permissions`,
        {
          color: colors.error,
          title: "Error",
        }
      );
    }
  }
}

export default playCommand;
