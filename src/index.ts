import "dotenv/config";
import Discord, { Message } from "discord.js";
import { prefix, token, autoReactChannels } from "./config";
import parseMessage from "./utils/parseMessage";
import setPresence from "./utils/setPresence";
import consoleColors from "colors";
import setUpCommands from "./utils/setUpCommands";
import autoReact from "./utils/autoReact";

if (process.env.CONSOLE_COLORS === "false") {
  consoleColors.disable();
}

const bot = new Discord.Client();

bot.on("ready", () => {
  console.log(
    `${consoleColors.green.bold("[ Ready ]")} Logged in as ${consoleColors.blue(bot.user.tag)}!`
  );
  setPresence(bot);
  setUpCommands(bot);
});

bot.on("message", (msg: Message) => {
  if (msg.author.bot || msg.system || msg.channel.type !== "text") return;
  parseMessage(msg);
  autoReact(msg, autoReactChannels.imageChannels, "❤️", (m) => {
    return m.attachments.size > 0 || m.embeds.length > 0;
  });
  autoReact(msg, autoReactChannels.todoChannel, "⏸️");
});

bot.on("messageUpdate", (_, newMsg) => {
  if (newMsg.author.bot || !newMsg.content.startsWith(prefix)) return;
  newMsg.fetch().then((_msg: Message) => {
    bot.emit("message", _msg);
  });
});

if (!token) {
  console.error(
    `${consoleColors.red.bold(
      "[ Error ] No token was provided"
    )}\nMake sure you've created .env file with your token assigned to TOKEN variable\nAlso don't forget to import 'dotenv/config' at the top of your main file`
  );
  process.exit(1);
}

bot.login(token);
