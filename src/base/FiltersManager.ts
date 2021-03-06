import {
  DefaultFilterPresets,
  FilterData,
  FiltersManagerInterface,
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
      bassboost: "bass=g=20,dynaudnorm=f=200",
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
      if (property.status === "enabled") {
        let arg = this._getFFMpegArgName(name);
        outputArgs.push(`${arg}${property.value}`);
      }
    }
    return outputArgs.join(",");
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
    //set the filter
    this._setFilterArgs(ffmpegArgs, msg.guild.id);
    //restart our audio stream but now with filters enabled
    await this.musicPlayer.restartAudioStream(msg);
  }
  async disableFilter(msg: Message) {
    const guildQueue = this.musicPlayer.getQueue(msg.guild.id);
    if (!guildQueue) return;
    //toggle filter state to OFF
    guildQueue.filter.isEnabled = false;
    guildQueue.filter.ffmpegArgs = null;
    //restart stream
    await this.musicPlayer.restartAudioStream(msg);
  }
  _setFilterArgs(ffmpegFilterString: string, guildId: string) {
    const guildQueue = this.musicPlayer.getQueue(guildId);
    if (!guildQueue) return;
    guildQueue.filter.isEnabled = true;
    guildQueue.filter.ffmpegArgs = ffmpegFilterString;
  }
  getFilterArgs(guildId: string) {
    const guildQueue = this.musicPlayer.getQueue(guildId);
    if (!guildQueue) return;
    return guildQueue.filter.ffmpegArgs;
  }
}

export default FiltersManager;
