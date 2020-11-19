import { Message, Song } from "discord.js";
import ytdl from "ytdl-core";

import { createQueue, getQueue } from "../../utils/music/queueManager";
import removePrefix from "../../utils/removePrefix";
import playSong from "../../utils/music/playSong";

async function playCommand(msg: Message) {
  //some validation so typescript isn't mad
  if (msg.channel.type !== "text") {
    return msg.channel.send(`You're trying to use this command in wrong channel type.`);
  }
  //check if member is in voiceChat and if bot has permissions to join and speak
  const userVoiceChannel = msg.member.voice.channel;
  if (!userVoiceChannel)
    return msg.channel.send("You need to be in a voice channel to play music.");
  const permissions = userVoiceChannel.permissionsFor(msg.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return msg.channel.send("I need the permissions to join and speak in your voice channel.");
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
      return msg.channel.send("You didn't provide song title");
    }
    const requestedSongTitle = extractedMatch.replace(/\s+/g, " ").trim();
    return msg.channel.send(
      `No youtube link detected. | Title: ${requestedSongTitle}. This is unsupported as of now`
    );
  }
  //# YOUTUBE URL
  const youtubeUrl = msg.content.match(youtubeUrlRegex).pop();
  const songInfo = await ytdl.getInfo(youtubeUrl);
  const songObject: Song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };
  let guildQueue = getQueue(msg.guild.id, msg.client);
  if (!guildQueue) {
    console.log("No queue initiated. Creating new one and playing song...");
    guildQueue = createQueue(msg.guild.id, msg.client);
    guildQueue.songs.push(songObject);
    msg.channel.send(`Added ${songObject.title} to queue`);

    //setup textChannel and voiceChannel on guildQueue
    guildQueue.textChannel = msg.channel;
    guildQueue.voiceChannel = userVoiceChannel;

    //try joining voiceChannel
    try {
      var connection = await userVoiceChannel.join();
      guildQueue.connection = connection;
      await guildQueue.connection.voice.setSelfDeaf(true);
      playSong(msg.guild, guildQueue.songs[0]);
    } catch (err) {
      // Printing the error message if the bot fails to join the voicechat
      console.log(err);
      msg.client.guildsQueue.delete(msg.guild.id);
      return msg.channel.send(err);
    }
  } else {
    console.log("There is a queue object already. Adding song...");
    guildQueue.songs.push(songObject);
    msg.channel.send(`Added ${songObject.title} to queue`);
  }
}

export default playCommand;
