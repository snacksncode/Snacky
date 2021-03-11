import {
  DefaultFilterPresets,
  FilterData,
  FilterDataObject,
  FiltersManagerInterface,
  GuildMusicQueue,
  Message,
  MusicPlayerInterface,
  PresetName,
} from "discord.js";

class FiltersManager implements FiltersManagerInterface {
  musicPlayer: MusicPlayerInterface;
  filterPresets: DefaultFilterPresets;
  ffmpegArgs: string;
  constructor(_musicPlayer: MusicPlayerInterface) {
    this.musicPlayer = _musicPlayer;
    this.filterPresets = {
      bassboost: "bass=g=15,dynaudnorm=f=200",
      vaporwave: "aresample=48000,asetrate=48000*0.8",
      nightcore: "aresample=48000,asetrate=48000*1.25",
      rotate: "apulsator=hz=0.08",
    };
  }
  _getFFMpegArgName(input: string): string {
    switch (input) {
      case "bass":
        return "bass=g=";
      case "normalization":
        return "dynaudnorm=f=";
      case "speed":
        return "aresample=48000,asetrate=48000*";
      case "rotate":
        return "apulsator=hz=";
    }
  }
  _generateFFMpegArgs(filterData: FilterData) {
    let outputArgs = [];
    for (let [name, property] of Object.entries(filterData)) {
      if ((property as FilterDataObject).status === "enabled") {
        let arg = this._getFFMpegArgName(name);
        outputArgs.push(`${arg}${property.value}`);
      }
    }
    return outputArgs.join(",");
  }

  //this one is called by the ffmpegArgs generator. I use it to update seed modifier for every guild
  //it's used to correctly calculate amount of "seconds" music has been played for
  detectFilterSpeedMod(guildQueue: GuildMusicQueue) {
    const speedModRegex = /asetrate=48000\*(\d{1,}\.?(\d{1,})?)/;
    const detectedSpeedMod = guildQueue?.filter?.args?.match(speedModRegex)?.[1];
    return detectedSpeedMod ? Number(detectedSpeedMod) : 1;
  }

  async generateAndApplyFilter(msg: Message, filterData: FilterData, usePreset?: PresetName) {
    const guildQueue = this.musicPlayer.getQueue(msg.guild.id);
    if (!guildQueue) return;
    let ffmpegArgs = "";
    //generate ffmpeg args string
    if (usePreset) {
      ffmpegArgs = this.filterPresets[usePreset];
    } else {
      ffmpegArgs = this._generateFFMpegArgs(filterData);
    }
    //set the filter & update it's state
    this._setFilterArgs(ffmpegArgs, guildQueue);
    const speedMod = this.detectFilterSpeedMod(guildQueue);
    //restart our audio stream but now with filters enabled
    await this.musicPlayer.restartAudioStream(msg, {
      applyFilter: true,
      filterSpeedModifier: speedMod,
    });
  }
  async disableFilter(msg: Message) {
    const guildQueue = this.musicPlayer.getQueue(msg.guild.id);
    if (!guildQueue) return;
    //detect speedMod of current filter
    const speedMod = this.detectFilterSpeedMod(guildQueue);
    //reset filterArgs on guildQueue
    guildQueue.filter.args = null;
    //restart stream
    await this.musicPlayer.restartAudioStream(msg, {
      filterSpeedModifier: speedMod,
    });
  }
  _setFilterArgs(ffmpegFilterString: string, guildQueue: GuildMusicQueue) {
    guildQueue.filter.args = ffmpegFilterString;
  }
}

export default FiltersManager;
