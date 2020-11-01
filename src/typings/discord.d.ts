declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
  }
  export interface Command {
    commandName: string;
    aliases?: string[];
    desc: string;
    exec: (msg: Message) => void;
    readonly help: string;
  }
  export interface Commands {
    [key: string]: Command;
  }
}
