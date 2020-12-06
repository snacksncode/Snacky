import { Message, Song } from "discord.js";
import { getQueue } from "./queueManager";
import ytdl from "discord-ytdl-core";
import outputEmbed from "../outputEmbed";
import { colors } from "../../config";

async function playSong(msg: Message, song: Song) {
  const guild = msg.guild;
  const guildQueue = getQueue(guild.id, guild.client);
  //function will call itself recursively so after we play the last song
  //it'll attempt to play song at guildQueue.songs[0] which will be undefined
  //it means that we have gone through the queue and can leave the channel
  if (!song) {
    guildQueue.isPlaying = false;
    guildQueue.voiceChannel.leave();
    outputEmbed(msg.channel, `No more songs in queue. Leaving...`, {
      title: "",
      color: colors.info,
    });
    guild.client.guildsQueue.delete(guild.id);
    return;
  }
  //get audioStream from ytdl
  try {
    let audioStream = ytdl(song.url, {
      filter: "audioonly",
      opusEncoded: true,
      highWaterMark: 1 << 25,
    });
    const voiceChannelDispatcher = guildQueue.connection
      .play(audioStream, {
        type: "opus",
        highWaterMark: 96,
        bitrate: 96,
      })
      .on("finish", () => {
        guildQueue.songs.shift();
        playSong(msg, guildQueue.songs[0]);
      })
      .on("debug", (info) => {
        console.log("--- DEBUG START ---");
        console.log(info);
        console.log("--- DEBUG END ---");
      })
      .on("error", (err) => {
        console.log("Error on dispatcher");
        console.error(err.message);
      });
    voiceChannelDispatcher.setVolume(guildQueue.bassboost ? 10.0 : 1.0);
    guildQueue.isPlaying = true;
    outputEmbed(
      msg.channel,
      `Playing [**${song.title}**](${song.url}) | Requested by ${song.requestedBy}`,
      {
        title: "",
        color: colors.success,
      }
    );
  } catch (err) {
    console.log(err);
    return outputEmbed(msg.channel, `Failed to play the song`, {
      title: "",
      color: colors.error,
    });
  }
}

export default playSong;
