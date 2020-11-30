import { Message, Song } from "discord.js";
import { getQueue } from "./queueManager";
import ytdl from "ytdl-core-discord";
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
    let audioStream = await ytdl(song.url, {
      filter: "audioonly",
    });
    const voiceChannelDispatcher = guildQueue.connection
      .play(audioStream, { type: "opus" })
      .on("finish", () => {
        guildQueue.songs.shift();
        playSong(msg, guildQueue.songs[0]);
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
        color: colors.info,
      }
    );
  } catch (_) {
    return outputEmbed(
      msg.channel,
      `Failed to retrieve video metadata. It's probably YouTube being a stupid cunt. Just try adding the song again`,
      {
        title: "",
        color: colors.error,
      }
    );
  }
}

export default playSong;
