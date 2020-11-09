import "dotenv/config";
import Discord, { Message } from "discord.js";
import { prefix, token, autoReactChannels } from "./config";
import parseMessage from "./utils/parseMessage";
import setPresence from "./utils/setPresence";
import consoleColors from "colors";
import setUpCommands from "./utils/setUpCommands";
import autoReact from "./utils/autoReact";

import { get, makeTemplate, set } from "./utils/musicStorage";

let timeouts = [];

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

  bot.guilds.cache.forEach((guild) => {
    makeTemplate(guild.id);
    console.log(
      `${consoleColors.green.bold(`[ Ready ]`)} Registering new guild: ${guild.name} (${guild.id})`
    );
  });
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

bot.on("guildCreate", (guild) => {
  makeTemplate(guild.id);
  console.log(`Joining ${guild.name} (${guild.id})`);
});

bot.on("guildDelete", (guild) => {
  set(guild.id, undefined);
  console.log(`Got kicked from: ${guild.name} (${guild.id})`);
});

bot.on("voiceStateUpdate", (oldState, newState) => {
  let d = get(oldState.guild.id);
  if (timeouts[oldState.guild.id]) clearTimeout(timeouts[oldState.guild.id]);

  if (oldState.channelID === d.channelId && newState.channelID !== d.channelId) {
    if (oldState.member.id === bot.user.id) {
      if (newState.channelID === null) {
        console.log(`Got disconnected from voice channel in server: ${oldState.guild.name}`);
        d?.dispatcher?.end();
        makeTemplate(oldState.guild.id);
      } else {
        console.log(`Got moved to another channel in server: ${oldState.guild.name}`);
        d.channelId = newState.channel.id;
        set(oldState.guild.id, d);
      }
    } else
      timeouts[oldState.guild.id] = setTimeout(() => {
        let a = oldState.guild.channels.resolve(d.channelId).members;
        if (a.size < 2) {
          oldState.channel.leave();
          makeTemplate(oldState.guild.id);

          timeouts[oldState.guild.id] = undefined;
          console.log(
            `Leaving channel, because 0 users is in channel on server ${oldState.guild.name}`
          );
        }
      }, 5000);
  }
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
