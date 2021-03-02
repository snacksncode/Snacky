import { Config } from "discord.js";

function getToken() {
  if (process.env.VERSION === "CANARY") {
    return process.env.TOKEN_CANARY;
  } else {
    return process.env.TOKEN_STABLE;
  }
}

function getPrefix() {
  if (process.env.VERSION === "CANARY") {
    return "sc!";
  } else {
    return "s!";
  }
}

const config: Config = {
  prefix: getPrefix(),
  token: getToken(),
  version: "2.9.1",
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
