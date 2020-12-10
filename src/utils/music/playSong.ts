import { Message, Song } from "discord.js";
import { getQueue } from "./queueManager";
import ytdl from "discord-ytdl-core";
import outputEmbed from "../outputEmbed";
import { colors } from "../../config";

async function playSong(msg: Message, song: Song) {
  const guild = msg.guild;
  const guildQueue = getQueue(guild.id, guild.client);
  /*
    function will call itself recursively so after we play the last song
    it'll attempt to play song at guildQueue.songs[0] which will be undefined
    it means that we have gone through the queue and can leave the channel
  */
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
    let audioStream = ytdl(song.id, {
      /*
        audio only filter broke livestreams so it got yeeted.
        livestreams still "buffer" a lot. Not really sure why
      */
      quality: "highestaudio",
      opusEncoded: true,
      encoderArgs: ["-af", "bass=g=10,dynaudnorm=f=200"],
      highWaterMark: 1 << 25,
    });
    //play the audioStream and repeatedly call itself
    const voiceChannelDispatcher = guildQueue.connection
      .play(audioStream, {
        type: "opus",
      })
      .on("finish", () => {
        guildQueue.songs.shift();
        playSong(msg, guildQueue.songs[0]);
      })
      .on("debug", (info) => {
        console.log(info);
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
