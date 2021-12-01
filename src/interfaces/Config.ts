import { ClientOptions } from "discord.js";

export interface Config {
  token: string;
  clientOptions: ClientOptions;
  commandsPath: string;
  eventsPath: string;
  debugGuildId: string;
}
