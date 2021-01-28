import { Config } from "discord.js";

const config: Config = {
  prefix: "s!",
  token: process.env.TOKEN,
  version: "2.5.1",
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
  },
  ownerId: "430795391265406990",
  mainServerId: "763094235217657876",
};

export default config;
