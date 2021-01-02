import {
  BotClient,
  CommandBaseInterface,
  CommandHelpObject,
  CommandOptions,
  CommandInfo,
} from "discord.js";

class Command implements CommandBaseInterface {
  client: BotClient;
  help: CommandHelpObject;
  commandName: string;
  info: CommandInfo;
  allowDMs: boolean;
  constructor(_client: BotClient, options: CommandOptions) {
    this.client = _client;
    this.commandName = options.name;
    this.allowDMs = false;
    this.info = {
      aliases: options.aliases || [],
      description: options.description || "No description provided",
      usage: options.usage || "No information about usage specified",
      example: options.example || "",
      permissions: options.permissions || [],
      category: options.category || "Other",
      hidden: options.hidden || false,
    };
    this.help = {
      aliases: this.info.aliases,
      name: this.commandName,
      description: this.info.description,
      usage: this.info.usage,
      category: this.info.category,
    };
  }
}

export default Command;
