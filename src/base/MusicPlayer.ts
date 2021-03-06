import {
  BotClient,
  FiltersManagerInterface,
  GuildMusicQueue,
  Message,
  MusicPlayerInterface,
  Song,
} from "discord.js";
import ytdl from "discord-ytdl-core";
import ytdlBase from "ytdl-core";
import { outputEmbed } from "../utils/generic";
import internal from "stream";
import FiltersManager from "./FiltersManager";

interface PlaySongOptions {
  seek?: number;
  noOutput?: boolean;
}

class MusicPlayer implements MusicPlayerInterface {
  client: BotClient;
  //Collection of music queues for each guild bot is playing in
  //Initiated created by using play command
  guildsQueue: Map<string, GuildMusicQueue>;

  filtersManager: FiltersManagerInterface;
  /*
    leaveVCTimeoutId is used to check if users are in VC
    e.x when user leaves VC and doesn't use stop command bot will
    automatically leave after 30s (by default)
  */
  leaveVCTimeoutId: ReturnType<typeof setTimeout>;
  /*
    finishedQueueTimeoutId is fired after queue has finished playing
    e.x. to give users 1min (by default) to pick a new song before leaving
  */
  finishedQueueTimeoutId: ReturnType<typeof setTimeout>;
  queueEditMode: boolean;
  filterEnabled: boolean;
  dispatchedStartingSeek: number;
  constructor(client: BotClient) {
    this.client = client;
    this.guildsQueue = new Map();
    this.leaveVCTimeoutId = null;
    this.finishedQueueTimeoutId = null;
    this.queueEditMode = false;
    this.filtersManager = new FiltersManager(this);
    this.filterEnabled = false;
    this.dispatchedStartingSeek = null;
  }

  async playSong(msg: Message, song: Song, options?: PlaySongOptions) {
    const guildQueue = this.getQueue(msg.guild.id);
    /*
      function will call itself recursively so after we play the last song
      it'll attempt to play song at guildQueue.songs[0] which will be undefined
      it means that we have gone through the queue and can leave the channel
    */
    if (!song) {
      //queue is empty
      const QUEUE_FINISH_LEAVE_DELAY = 60 * 1000; //60s
      this.client.logger.log(
        { color: "warning", name: "Music Player: Debug" },
        "Queue is now empty. Setting up 60s timer"
      );
      this.finishedQueueTimeoutId = setTimeout(() => {
        this._leaveVC(msg.guild.id);
        this.deleteQueue(msg.guild.id);
      }, QUEUE_FINISH_LEAVE_DELAY);
      return;
    }
    //get audioStream from ytdl
    try {
      let audioStream: internal.Readable;
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
          seek: options?.seek || 0,
          highWaterMark: 1 << 25,
          // encoderArgs: ["-af", "bass=g=20,dynaudnorm=f=200"],
          encoderArgs: this.filterEnabled ? ["-af", this.filtersManager.ffmpegArgs] : null,
        });
      }
      //play the audioStream and repeatedly call itself
      const voiceChannelDispatcher = guildQueue.connection
        .play(audioStream, {
          type: song.isLive ? "unknown" : "opus",
        })
        .on("finish", () => {
          this.client.logger.log(
            { name: "Music Player: Debug", color: "info" },
            "Finish event triggered on dispatcher"
          );
          this.songFinishedPlaying(msg);
        })
        // .on("debug", (debugInfo) => {
        //   console.log(debugInfo);
        // })
        .on("error", (err) => {
          console.error(err.message);
        });
      guildQueue.isPlaying = true;
      this.dispatchedStartingSeek = options?.seek || 0;
      voiceChannelDispatcher.setVolume(guildQueue.bassboost ? 10.0 : 1.0);
      if (!options?.noOutput) {
        outputEmbed(
          msg.channel,
          `Playing **[${song.title}](${song.url})** | Requested by ${song.requestedBy}`,
          {
            color: this.client.config.colors.success,
            footerText: song.isLive
              ? `I've detected that you're trying to play a livestream. They might "lag" a little bit because I cannot optimize audio stream on a fly`
              : null,
          }
        );
      }
    } catch (err) {
      console.log(err);
      outputEmbed(msg.channel, `Failed to play the song`, {
        color: this.client.config.colors.error,
      });
      return;
    }
  }

  songFinishedPlaying(msg: Message) {
    const guildQueue = this.getQueue(msg.guild.id);
    if (!guildQueue) return;
    guildQueue.isPlaying = false;
    //if looping is disabled remove current song from queue
    if (guildQueue.loopMode === "off") {
      guildQueue.songs.shift();
    } else if (guildQueue.loopMode === "queue") {
      const song = guildQueue.songs.shift();
      guildQueue.songs.push(song);
    }
    this.playSong(msg, guildQueue.songs[0]);
  }

  async restartAudioStream(msg: Message, customSeek?: number) {
    const guildQueue = this.getQueue(msg.guild.id);
    if (!guildQueue) return; //I'll put this one just in case
    //amount of seconds song has been playing for
    const dispatcher = guildQueue.connection.dispatcher;
    const seekAmount = Math.floor(dispatcher.streamTime / 1000);
    //kill current audio stream
    await this.playSong(msg, guildQueue.songs[0], {
      seek: customSeek || seekAmount,
      noOutput: true,
    });
  }

  deleteQueue(guildId: string): boolean {
    return this.guildsQueue.delete(guildId);
  }

  leaveVCIfEmpty(guildId: string) {
    const guildQueue = this.guildsQueue.get(guildId);
    if (!guildQueue) return;
    const voiceChannel = guildQueue.voiceChannel;
    if (voiceChannel.members.size > 1) return;
    this._leaveVC(guildId);
  }

  _leaveVC(guildId: string) {
    const guildQueue = this.guildsQueue.get(guildId);
    guildQueue.voiceChannel.leave();
    this.deleteQueue(guildId);
    outputEmbed(guildQueue.textChannel, `Snacky has left voice chat`, {
      color: this.client.config.colors.info,
    });
  }

  createQueue(guildId: string): GuildMusicQueue {
    let defaultQueueObject: GuildMusicQueue = {
      textChannel: null,
      voiceChannel: null,
      connection: null,
      songs: [],
      volume: 1.0,
      bassboost: false,
      loopMode: "off",
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
