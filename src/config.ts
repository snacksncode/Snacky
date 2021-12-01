import { Intents } from "discord.js";
import path from "path/posix";
import { EnvLoader } from "./core/EnvLoader";
import { Config } from "./interfaces/Config";

EnvLoader.load(path.resolve(__dirname, "../"));

const config: Config = {
  token: process.env.TOKEN as string, // EnvLoader should assure that this exists
  clientOptions: {
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  },
  commandsPath: "commands/**/*.command.ts",
  eventsPath: "events/**/*.event.ts",
  debugGuildId: "763094235217657876",
};

export default config;
