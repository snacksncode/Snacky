import { BotClient, GuildMusicQueue, Message, MusicPlayerInterface, Song } from "discord.js";
import ytdl from "discord-ytdl-core";
import ytdlBase from "ytdl-core";
import { outputEmbed } from "../utils/generic";

class MusicPlayer implements MusicPlayerInterface {
  client: BotClient;
  guildsQueue: Map<string, GuildMusicQueue>;
  constructor(client: BotClient) {
    this.client = client;
    this.guildsQueue = new Map();
  }

  async playSong(msg: Message, song: Song) {
    const guild = msg.guild;
    const guildQueue = this.getQueue(guild.id);
    /*
      function will call itself recursively so after we play the last song
      it'll attempt to play song at guildQueue.songs[0] which will be undefined
      it means that we have gone through the queue and can leave the channel
    */
    if (!song) {
      guildQueue.isPlaying = false;
      guildQueue.voiceChannel.leave();
      outputEmbed(msg.channel, `No more songs in queue. Leaving...`, {
        color: this.client.config.colors.info,
      });
      this.guildsQueue.delete(guild.id);
      return;
    }
    //get audioStream from ytdl
    try {
      let audioStream;
      if (song.isLive) {
        //use base ytdl-core and get HttpLiveStream itag
        audioStream = ytdlBase(song.id, {
          isHLS: song.isLive,
          highWaterMark: 1 << 25,
        } as any); //any cast here because isHLS is not recognized for some reason
      } else {
        //use discord-ytdl-core and output direct opus stream
        audioStream = ytdl(song.id, {
          quality: "highestaudio",
          filter: "audioonly",
          opusEncoded: true,
          encoderArgs: ["-af", "bass=g=5,dynaudnorm=f=200"],
          highWaterMark: 1 << 25,
        });
      }
      //play the audioStream and repeatedly call itself
      const voiceChannelDispatcher = guildQueue.connection
        .play(audioStream, {
          type: song.isLive ? "unknown" : "opus",
        })
        .on("finish", () => {
          guildQueue.songs.shift();
          this.playSong(msg, guildQueue.songs[0]);
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
        `Playing [**${song.title}**](${song.url}) | Requested by ${song.requestedBy}${
          song.isLive
            ? `\nI've detected that you're trying to play a livestream. They might "lag" a little bit because I cannot optimize audio stream on a fly`
            : ""
        }`,
        {
          color: this.client.config.colors.success,
        }
      );
    } catch (err) {
      console.log(err);
      outputEmbed(msg.channel, `Failed to play the song`, {
        color: this.client.config.colors.error,
      });
      return;
    }
  }

  createQueue(guildId: string): GuildMusicQueue {
    let defaultQueueObject: GuildMusicQueue = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      volume: 1.0,
      bassboost: false,
      isPlaying: false,
    };

    this.guildsQueue.set(guildId, defaultQueueObject);
    return this.guildsQueue.get(guildId);
  }

  getQueue(guildId: string) {
    return this.guildsQueue.get(guildId);
  }
}

export default MusicPlayer;
