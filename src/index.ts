import { Client, Intents } from "discord.js";
import { Snacky } from "./core/bot";
import { EnvLoader } from "./core/env_loader";
// import logger from "./core/logger";

EnvLoader.load();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
  if (!client.user) return;
  new Snacky(client, "sc!");
});

client.login(process.env.TOKEN);
