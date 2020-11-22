declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
    guildsQueue: Map<string, GuildMusicQueue>;
  }
  export interface Command {
    readonly commandName: string;
    readonly aliases?: string[];
    readonly desc: string;
    readonly requiredPermissions?: string[];
    readonly exec: (msg: Message) => void;
    readonly help: () => EmbedFieldData[];
    readonly hidden?: boolean;
  }
  export interface CommandsExporter {
    [key: string]: Command;
  }

  export interface CustomReactionEmoji {
    name: string;
    url: string;
  }

  export interface FormatHelpInput {
    desc: string;
    aliases?: string;
    usage: string;
    example?: string;
    reqPerms?: string[];
  }

  // export interface GuildMusicQueue {
  //   id: string;
  //   generated: string;
  //   isPlaying: boolean;
  //   joined: boolean;
  //   channelId: string;
  //   loop: boolean;
  //   dispatcher: StreamDispatcher;
  //   connection: VoiceConnection;
  //   bassBoost: boolean;
  //   volume: number;
  //   timeout: any;
  //   songs: Map<number, Song>;
  // }
  export interface GuildMusicQueue {
    textChannel: null | TextChannel;
    voiceChannel: null | VoiceChannel;
    connection: null | VoiceConnection;
    bassboost: boolean;
    songs: Song[];
    volume: number;
    isPlaying: boolean;
  }

  export interface AutoReactionChannel {
    id: string;
    filter: "none" | "images_only";
    emoji: string | GuildEmoji;
    customEmoji: boolean;
  }
  export interface Song {
    title: string;
    url: string;
    length: number;
    formattedLength: string;
    // author: string;
    // thumbnail: string;
  }
}
