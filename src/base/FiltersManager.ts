import {
  DefaultFilterPresets,
  FilterDataObject,
  FiltersManagerInterface,
  Message,
  MusicPlayerInterface,
} from "discord.js";

class FiltersManager implements FiltersManagerInterface {
  musicPlayer: MusicPlayerInterface;
  filterData: {
    bass: FilterDataObject;
    normalization: FilterDataObject;
    speed: FilterDataObject;
    rotate: FilterDataObject;
  };
  filterPresets: DefaultFilterPresets;
  ffmpegArgs: string;
  constructor(_musicPlayer: MusicPlayerInterface) {
    this.musicPlayer = _musicPlayer;
    this.filterData = {
      bass: {
        status: "enabled",
        value: 25,
      },
      normalization: {
        status: "enabled",
        value: 200,
      },
      speed: {
        status: "disabled",
        value: 1.4,
      },
      rotate: {
        status: "disabled",
        value: 0.2,
      },
    };
    this.ffmpegArgs = null;
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
  _generateFFMpegArgs() {
    let outputArgs = [];
    for (let [name, property] of Object.entries(this.filterData)) {
      if (property.status === "enabled") {
        let arg = this._getFFMpegArgName(name);
        outputArgs.push(`${arg}${property.value}`);
      }
    }
    this.ffmpegArgs = outputArgs.join(",");
  }
  async generateAndApplyFilter(msg: Message, usePreset?: string) {
    //generate ffmpeg args string
    if (usePreset) {
      this.ffmpegArgs = this.filterPresets[usePreset];
    } else {
      this._generateFFMpegArgs();
    }
    //toggle filter state to ON
    this.musicPlayer.filterEnabled = true;
    //restart our audio stream but now with filters enabled
    await this.musicPlayer.restartAudioStream(msg);
  }
}

export default FiltersManager;
