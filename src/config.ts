import { Config } from "discord.js";

let useCanary = Boolean(process.env.USE_CANARY);

const config: Config = {
  prefix: useCanary ? "sc!" : "s!",
  token: useCanary ? process.env.TOKEN_CANARY : process.env.TOKEN_STABLE,
  ignoreUnknownCommands: false,
  version: "2.10.0",
  debugMode: false,
  database: {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  paths: {
    commands: "/commands/**/*.command.ts", //you can use pattern matching here
    events: "/events/**/*.event.ts",
  },
  colors: {
    info: "#4895ef",
    success: "#45bb8a",
    warn: "#ffcc4d",
    error: "#ef4949",
  },
  reactionEmojis: {
    error: "776486161836277781",
    success: "776484399038464022",
    pepeNote: "808753640793047080",
  },
  ownerId: "430795391265406990",
  mainServerId: "763094235217657876",
  _testDatabaseConnection: false,
  _logApproximateMemoryUsage: {
    enabled: true,
    intervalSec: 60 * 10, //10min
  },
};

export default config;
