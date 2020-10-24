import "dotenv/config";
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

if (!token) {
  console.error(
    "No token was provided. Make sure you've created .env file with your token assigned to TOKEN variable and that you've imported 'dotenv/config' at the top of your main file."
  );
  process.exit(1);
}

client.login(token);
