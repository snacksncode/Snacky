import Discord, { TextChannel } from "discord.js";
import { token } from "./config";
import parseMessage from "./utils/parseMessage";
import setPresence from "./utils/setPresence";

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`[ Ready ] Logged in as ${client.user.tag}!`);
  setPresence(client);
});

client.on("message", (msg) => {
  if (msg.author.bot || msg.system || msg.channel.type !== "text") return;
  let channel: TextChannel = msg.channel;
  parseMessage(msg, channel);
});

client.login(token);
