import { Message } from "discord.js";

declare module "discord.js" {
  export interface CommandInterface extends CommandBaseInterface {
    run(msg: Message): void;
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
    run(...args: any): void;
  }

  export interface EventBaseInterface {
    client: BotClient;
    eventName: string;
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
    bassboost: boolean;
    songs: Song[];
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
  export interface Config {
    token: string;
    version: string;
    prefix: string;
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
    };
  }

  export interface MusicPlayerInterface {
    client: BotClient;
    guildsQueue: Map<string, GuildMusicQueue>;
    leaveVCTimeoutId: ReturnType<typeof setTimeout>;
    finishedQueueTimeoutId: ReturnType<typeof setTimeout>;
    createQueue(guildId: string): GuildMusicQueue;
    getQueue(guildId: string): GuildMusicQueue;
    playSong(msg: Message, song: Song): Promise<void>;
    leaveVCIfEmpty(guildId: string): void;
  }

  export interface BotClient extends Client {
    client: Client;
    logger: LoggerInterface;
    commands: Collection<string, CommandInterface>;
    // guildsQueue: Map<string, GuildMusicQueue>;
    player: MusicPlayerInterface;
    config: Config;
    _login(token: string): Promise<string>;
    _loadCommands(path: string): void;
    _loadEvents(path: string): void;
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
}
