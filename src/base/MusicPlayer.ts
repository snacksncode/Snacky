import {
  BotClient,
  FiltersManagerInterface,
  GuildMusicQueue,
  Message,
  MusicPlayerInterface,
  RestartStreamOptions,
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
  applyFiler?: boolean;
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
  dispatchedStartingSeek: number;
  constructor(client: BotClient) {
    this.client = client;
    this.guildsQueue = new Map();
    this.leaveVCTimeoutId = null;
    this.finishedQueueTimeoutId = null;
    this.queueEditMode = false;
    this.filtersManager = new FiltersManager(this);
    this.dispatchedStartingSeek = null;
  }

  calculateSeekBasedOnSpeed(seek: number, guildQueue: GuildMusicQueue): number {
    if (seek) {
      const speedMod = this.filtersManager.detectFilterSpeedMod(guildQueue);
      return seek / speedMod;
    } else {
      return 0;
    }
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
        { color: "info", name: "Music Player: Queue" },
        "\nQueue is empty! Setting up 60s timer..."
      );
      this.finishedQueueTimeoutId = setTimeout(() => {
        this._leaveVC(msg.guild.id, "Empty Queue Timeout");
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
          seek: this.calculateSeekBasedOnSpeed(options?.seek, guildQueue),
          highWaterMark: 1 << 25,
          encoderArgs: options?.applyFiler ? ["-af", guildQueue.filter.args] : null,
        });
      }
      //play the audioStream and repeatedly call itself
      const voiceChannelDispatcher = guildQueue.connection
        .play(audioStream, {
          type: song.isLive ? "unknown" : "opus",
        })
        .on("finish", () => {
          this.songFinishedPlaying(msg, options?.applyFiler);
        })
        // .on("debug", (debugInfo) => {
        //   console.log(debugInfo);
        // })
        .on("error", (err) => {
          console.error(err.message);
        });
      guildQueue.isPlaying = true;
      this.dispatchedStartingSeek = options?.seek || 0;
      voiceChannelDispatcher.setVolume(guildQueue.earRape ? 10.0 : 1.0);
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

  songFinishedPlaying(msg: Message, keepFilter?: boolean) {
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
    this.playSong(msg, guildQueue.songs[0], { applyFiler: keepFilter });
  }

  async restartAudioStream(msg: Message, options?: RestartStreamOptions) {
    const guildQueue = this.getQueue(msg.guild.id);
    if (!guildQueue) return; //I'll put this one just in case
    //amount of seconds song has been playing for
    const seekAmount = this.getDispatcherStreamTime(guildQueue, options?.filterSpeedModifier || 1);
    //kill current audio stream
    await this.playSong(msg, guildQueue.songs[0], {
      seek: options?.customSeek || seekAmount,
      noOutput: true,
      applyFiler: options?.applyFilter,
    });
  }

  getDispatcherStreamTime(guildQueue: GuildMusicQueue, speedMod: number = 1) {
    const dispatcher = guildQueue.connection.dispatcher;
    return Math.floor((dispatcher.streamTime / 1000) * speedMod + this.dispatchedStartingSeek);
  }

  deleteQueue(guildId: string): boolean {
    return this.guildsQueue.delete(guildId);
  }

  leaveVCIfEmpty(guildId: string) {
    const guildQueue = this.guildsQueue.get(guildId);
    if (!guildQueue) return;
    this.client.logger.log(
      { color: "info", name: `Music Player: Timeout Fired` },
      `\nServer: ${guildQueue.voiceChannel.guild.name}`
    );
    const voiceChannel = guildQueue.voiceChannel;
    if (voiceChannel.members.size > 1) return;
    this._leaveVC(guildId, "Empty VC Timeout");
  }

  _leaveVC(guildId: string, reason: string = "Not Provided") {
    const guildQueue = this.guildsQueue.get(guildId);
    if (!guildQueue) return;
    guildQueue.voiceChannel.leave();
    this.client.logger.log(
      { color: "info", name: `Voice State: Left VC` },
      `\nServer: ${guildQueue.voiceChannel.guild.name}\nReason: ${reason}\nVC: ${guildQueue.voiceChannel.name}`
    );
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
      earRape: false,
      filter: {
        args: null,
        selectedPreset: null,
      },
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
