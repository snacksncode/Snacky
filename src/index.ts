import "dotenv/config";
import Discord, { Message } from "discord.js";
import consoleColors from "colors";

import { prefix, token, autoReactChannels, reactionEmojis } from "./config";

import parseMessage from "./utils/parseMessage";
import setupPresence from "./utils/setupPresence";
import setupCommands from "./utils/setupCommands";
import setupGuilds from "./utils/setupGuilds";
import autoReact from "./utils/autoReact";
import { get, makeTemplate, set } from "./utils/musicStorage";
import getEmojiByName from "./utils/getEmojiByName";
import setupReactionEmojis from "./utils/setupReactionEmojis";

//fujka @filip rewrite this ew
let timeouts = [];

if (process.env.CONSOLE_COLORS === "false") {
  consoleColors.disable();
}

const bot = new Discord.Client();

bot.on("ready", () => {
  console.log(
    `${consoleColors.green("[ Ready ]")} Logged in as ${consoleColors.blue(bot.user.tag)}`
  );
  setupPresence(bot);
  setupCommands(bot);
  setupGuilds(bot);
});

bot.on("message", (msg: Message) => {
  //ignore DM's, messages from bot and system messages
  if (msg.author.bot || msg.system || msg.channel.type !== "text") return;
  //normal message parsing
  parseMessage(msg);
  //auto react to messages
  let successEmoji = getEmojiByName(reactionEmojis.success.name, msg.guild);
  let heartEmoji = getEmojiByName("heart", msg.guild);
  autoReact(msg, autoReactChannels.imageChannels, heartEmoji, (m) => {
    return m.attachments.size > 0 || m.embeds.length > 0;
  });
  autoReact(msg, autoReactChannels.todoChannel, successEmoji);
});

bot.on("messageUpdate", (_, newMsg) => {
  if (newMsg.author.bot || !newMsg.content.startsWith(prefix)) return;
  newMsg.fetch().then((_msg: Message) => {
    bot.emit("message", _msg);
  });
});

bot.on("guildCreate", (guild) => {
  makeTemplate(guild.id);
  setupReactionEmojis(guild);
  console.log(`Joining ${guild.name} (${guild.id})`);
});

bot.on("guildDelete", (guild) => {
  set(guild.id, undefined);
  console.log(`Got kicked from: ${guild.name} (${guild.id})`);
});

//ugh fix that
bot.on("voiceStateUpdate", (oldState, newState) => {
  const voiceChannel = oldState;
  let d = get(voiceChannel.guild.id); //TODO: change names to better ones :/
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
        const voiceChannelMembers = oldState.guild.channels.resolve(oldState.channel.id).members;
        if (voiceChannelMembers.size < 2) {
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
