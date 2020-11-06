import "dotenv/config";
import Discord, { Message } from "discord.js";
import { prefix, token, catsChannelId } from "./config";
import parseMessage from "./utils/parseMessage";
import setPresence from "./utils/setPresence";
import colors from "colors";
import setUpCommands from "./utils/setUpCommands";
import autoReact from "./utils/autoReact";

if (process.env.CONSOLE_COLORS === "false") {
  colors.disable();
}

const bot = new Discord.Client();

bot.on("ready", () => {
  console.log(`${colors.green.bold("[ Ready ]")} Logged in as ${colors.blue(bot.user.tag)}!`);
  setPresence(bot);
  setUpCommands(bot);
});

bot.on("message", (msg: Message) => {
  if (msg.author.bot || msg.system || msg.channel.type !== "text") return;
  parseMessage(msg);
  autoReact(msg, catsChannelId, "❤️", (m) => m.attachments.size > 0);
});

bot.on("messageUpdate", (_, newMsg) => {
  if (newMsg.author.bot || !newMsg.content.startsWith(prefix)) return;
  newMsg.fetch().then((_msg: Message) => {
    bot.emit("message", _msg);
  });
});

if (!token) {
  console.error(
    "No token was provided. Make sure you've created .env file with your token assigned to TOKEN variable and that you've imported 'dotenv/config' at the top of your main file."
  );
  process.exit(1);
}

bot.login(token);
