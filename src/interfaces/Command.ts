import { GuildMember, Message, CommandInteraction, ApplicationCommandOptionData } from "discord.js";

export interface Config {
  token: string;
}

export interface CallbackOptions {
  member: GuildMember;
  message?: Message;
  args?: Array<string>;
  interaction?: CommandInteraction;
}

export interface Command {
  name: string;
  type?: CommandType;
  aliases?: Array<string>;
  minArgs?: number;
  maxArgs?: number;
  expectedArgs?: string;
  options?: Array<ApplicationCommandOptionData>;
  permissions?: Array<string>;
  roles?: Array<string>;
  category: string;
  description: string;
  run: (args: CallbackOptions) => void;
}

export enum CommandType {
  SLASH,
  NORMAL,
  BOTH,
}
