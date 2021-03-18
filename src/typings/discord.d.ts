import { Connection } from "mongoose";
declare module "discord.js" {
  export interface CommandInterface extends CommandBaseInterface {
    run(msg: Message): Promise<any>;
  }

  export interface PlayCommandInterface extends CommandInterface {
    processSong(url: string, msg: Message): Promise<void>;
    processPlaylist(
      url: string,
      msg: Message,
      putSongAsFirst: boolean,
      randomizePlaylist: boolean
    ): Promise<void>;
    updateQueueAndJoinVC(
      msg: Message,
      songsToAdd: Song[],
      userVoiceChannel: VoiceChannel,
      playlistName?: string
    ): Promise<void>;
  }

  export interface QueueCommandInterface extends CommandInterface {
    generatedPages: Collection<string, MessageEmbed[]>;
    queueMessages: Collection<string, QueueMessageObject>;
    songsPerPage: number;
    swapSongsInQueue(msg: Message, args: string[]): Promise<void>;
    playSongNextInQueue(msg: Message, args: string[]): Promise<void>;
    moveSongInQueue(msg: Message, args: string[]): Promise<void>;
    removeSongFromQueue(msg: Message, args: string[]): Promise<void>;
    updateRefQueueEmbed(msg: Message): Promise<void>;
    generateQueueEmbeds(guildId: string, songs: Song[], songsLimit: number): MessageEmbed[];
    attachCollectorToEmbed(authorId: string, guildId: string): Promise<void>;
    outputQueueEmbed(msg: Message, queueEditEmbed?: boolean): Promise<void>;
    generateQueuePageString(page: Song[], songs: Song[]): string;
  }

  export interface QueueMessageObject {
    ref: Message;
    collector: ReactionCollector;
    authorId: string;
  }

  export interface CommandHelpObject {
    name: string;
    aliases: string[];
    usage: string;
    description: string;
    category: string;
  }

  export interface CommandOptions {
    name: string;
    description: string;
    usage: string;
    category: CommandCategory;
    example?: string;
    aliases?: string[];
    hidden?: boolean;
    permissions?: PermissionString[];
    allowDMs?: boolean;
  }

  export interface CommandBaseInterface {
    client: BotClient;
    help: CommandHelpObject;
    commandName: string;
    info: CommandInfo;
    allowDMs: boolean;
  }

  export interface CommandInfo {
    aliases: string[];
    description: string;
    permissions: PermissionString[];
    usage: string;
    example: string;
    hidden: boolean;
    category: CommandCategory;
  }

  export type CommandCategory =
    | "Information"
    | "Music"
    | "Fun"
    | "Moderation"
    | "Special"
    | "Other";
  export interface Event extends EventBaseInterface {
    run(...args: any): Promise<any>;
  }

  export interface EventBaseInterface {
    client: BotClient;
    eventName: string;
    ignoreEvent?: boolean;
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

  export interface GuildMusicQueue {
    textChannel: null | TextChannel;
    voiceChannel: null | VoiceChannel;
    connection: null | VoiceConnection;
    earRape: boolean;
    loopMode: "song" | "queue" | "off";
    songs: Song[];
    filter: {
      args: string;
      selectedPreset: PresetName | null;
    };
    volume: number;
    isPlaying: boolean;
  }

  export interface AutoReactionChannel {
    id: string;
    filter: (m: Message) => boolean;
    emojis: AutoReactionEmojis[];
  }

  export interface AutoReactionEmojis {
    emoji: string | GuildEmoji;
    customEmoji: boolean;
  }
  export interface Song {
    id: string;
    title: string;
    url: string;
    length: number;
    formattedLength: string;
    requestedBy: User;
    isLive: boolean;
  }

  export interface DatabaseManagerInterface {
    client: BotClient;
    connection: Connection | null;
    testConnection(): Promise<void>;
  }

  export interface Config {
    token: string;
    version: string;
    prefix: string;
    ignoreUnknownCommands: boolean;
    debugMode: boolean;
    database: {
      user: string;
      password: string;
    };
    paths: {
      commands: string;
      events: string;
    };
    colors: {
      info: string;
      warn: string;
      success: string;
      error: string;
    };
    ownerId: string;
    mainServerId: string;
    reactionEmojis: {
      success: string;
      error: string;
      pepeNote: string;
    };
  }

  export interface MusicPlayerInterface {
    client: BotClient;
    guildsQueue: Map<string, GuildMusicQueue>;
    leaveVCTimeoutId: ReturnType<typeof setTimeout>;
    finishedQueueTimeoutId: ReturnType<typeof setTimeout>;
    queueEditMode: boolean;
    dispatchedStartingSeek: number;
    filtersManager: FiltersManagerInterface;
    createQueue(guildId: string): GuildMusicQueue;
    getQueue(guildId: string): GuildMusicQueue;
    playSong(msg: Message, song: Song): Promise<void>;
    deleteQueue(guildId: string): boolean;
    _leaveVC(guildId: string, reason?: string): void;
    restartAudioStream(msg: Message, options?: RestartStreamOptions): Promise<void>;
    leaveVCIfEmpty(guildId: string): void;
    getDispatcherStreamTime(guildQueue: GuildMusicQueue, speedMod: number): number;
  }

  export interface RestartStreamOptions {
    customSeek?: number;
    filterSpeedModifier?: number;
    applyFilter?: boolean;
  }

  export interface BotClient extends Client {
    client: Client;
    logger: LoggerInterface;
    commands: Collection<string, CommandInterface>;
    // guildsQueue: Map<string, GuildMusicQueue>;
    player: MusicPlayerInterface;
    database: DatabaseManagerInterface;
    config: Config;
    init(): void;
  }

  export interface LoggerInterface {
    log(flag: LoggerFlag, message: string): void;
    getColor(color: FlagColor): string;
  }

  export type FlagColor = "success" | "error" | "warning" | "info";

  export interface LoggerFlag {
    name: string;
    color: FlagColor;
  }

  export interface FiltersManagerInterface {
    filterPresets: DefaultFilterPresets;
    generateAndApplyFilter(
      msg: Message,
      filterData: FilterData,
      usePreset?: PresetName
    ): Promise<void>;
    detectFilterSpeedMod(guildQueue: GuildMusicQueue): number;
    disableFilter(msg: Message): Promise<void>;
  }

  export type PresetName = "bassboost" | "nightcore" | "vaporwave" | "rotate";

  export interface DefaultFilterPresets {
    bassboost: string;
    rotate: string;
    vaporwave: string;
    nightcore: string;
  }

  export interface FilterData {
    bass: FilterDataObject;
    normalization: FilterDataObject;
    speed: FilterDataObject;
    rotate: FilterDataObject;
  }

  export type FilterDataObject = {
    status: "disabled" | "enabled";
    value: number;
  };
}
