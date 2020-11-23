import { Guild, Song } from "discord.js";
import { getQueue } from "./queueManager";
import ytdl from "ytdl-core-discord";

async function playSong(guild: Guild, song: Song) {
  const guildQueue = getQueue(guild.id, guild.client);
  //function will call itself recursively so after we play the last song
  //it'll attempt to play song at guildQueue.songs[0] which will be undefined
  //it means that we have gone through the queue and can leave the channel
  if (!song) {
    guildQueue.isPlaying = false;
    guildQueue.voiceChannel.leave();
    guildQueue.textChannel.send("No more songs to play. Leaving...");
    guild.client.guildsQueue.delete(guild.id);
    return;
  }
  let stream = await ytdl(song.url, {
    filter: "audioonly",
  });
  const voiceChannelDispatcher = guildQueue.connection
    .play(stream, { type: "opus" })
    .on("finish", () => {
      guildQueue.songs.shift();
      playSong(guild, guildQueue.songs[0]);
    })
    .on("error", (err) => {
      console.log("Error on dispatcher");
      console.error(err.message);
    });
  voiceChannelDispatcher.setVolume(1);
  guildQueue.isPlaying = true;
  guildQueue.textChannel.send(`Started playing: **${song.title}**`);
}

export default playSong;
