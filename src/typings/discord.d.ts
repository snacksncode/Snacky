import { EmbedFieldData } from "discord.js";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
  }
  export interface Command {
    readonly commandName: string;
    readonly aliases?: string[];
    readonly desc: string;
    readonly exec: (msg: Message) => void;
    readonly help: () => EmbedFieldData[];
  }
  export interface CommandsExporter {
    [key: string]: Command;
  }
}
