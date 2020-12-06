import { Message, Song } from "discord.js";
import ytdl from "ytdl-core";

import { createQueue, getQueue } from "../../utils/music/queueManager";
import removePrefix from "../../utils/removePrefix";
import playSong from "../../utils/music/playSong";
import formatSongLength from "../../utils/music/formatSongLength";
import outputEmbed from "../../utils/outputEmbed";
import { colors } from "../../config";

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
  const youtubeUrlRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?/g;
  const hasYoutubeUrl = youtubeUrlRegex.test(msg.content);
  if (!hasYoutubeUrl) {
    // #TITLE
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
    return outputEmbed(
      msg.channel,
      `I'm a lazy piece of shit and didn't implement yt search. Only youtube links are supported as of now.`,
      {
        color: colors.error,
        title: "",
        fields: [
          {
            name: "Detected song name:",
            value: requestedSongTitle,
          },
        ],
      }
    );
  }
  //# YOUTUBE URL
  try {
    const youtubeUrl = msg.content.match(youtubeUrlRegex).pop();
    const songInfo = await ytdl.getInfo(youtubeUrl);
    const songObject: Song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      length: Number(songInfo.videoDetails.lengthSeconds),
      formattedLength: formatSongLength(Number(songInfo.videoDetails.lengthSeconds)),
      requestedBy: msg.author,
    };
    let guildQueue = getQueue(msg.guild.id, msg.client);
    if (!guildQueue) {
      guildQueue = createQueue(msg.guild.id, msg.client);
      guildQueue.songs.push(songObject);
      outputEmbed(msg.channel, `Added [**${songObject.title}**](${songObject.url}) to queue`, {
        title: "",
        color: colors.info,
      });

      //setup textChannel and voiceChannel on guildQueue
      guildQueue.textChannel = msg.channel;
      guildQueue.voiceChannel = userVoiceChannel;

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
    } else {
      guildQueue.songs.push(songObject);
      outputEmbed(msg.channel, `Added [**${songObject.title}**](${songObject.url}) to queue`, {
        title: "",
        color: colors.info,
      });
    }
  } catch (_) {
    return outputEmbed(msg.channel, `Failed to get song info. Try again?`, {
      title: "",
      color: colors.error,
    });
  }
}

export default playCommand;
