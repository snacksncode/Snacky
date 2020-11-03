declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
  }
  export interface Command {
    readonly commandName: string;
    readonly aliases?: string[];
    readonly desc: string;
    readonly requiredPermissions?: string[];
    readonly exec: (msg: Message) => void;
    readonly help: () => EmbedFieldData[];
  }
  export interface CommandsExporter {
    [key: string]: Command;
  }

  export interface FormatHelpInput {
    desc: string;
    aliases?: string;
    usage: string;
    example?: string;
    reqPerms?: string[];
  }
}
