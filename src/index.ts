import "dotenv/config";
import Discord, { Message } from "discord.js";
import consoleColors from "colors";

import { prefix, token, autoReactChannels, colors } from "./config";
import parseMessage from "./utils/parseMessage";
import autoReact from "./utils/autoReact";

import setupPresence from "./utils/setup/setupPresence";
import setupCommands from "./utils/setup/setupCommands";
import setupQueue from "./utils/setup/setupQueue";
import setupReactionEmojis from "./utils/setup/setupReactionEmojis";
import { getQueue } from "./utils/music/queueManager";
import outputEmbed from "./utils/outputEmbed";

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
  setupQueue(bot);
});

bot.on("message", (msg: Message) => {
  //ignore DM's, messages from bot and system messages
  if (msg.author.bot || msg.system || msg.channel.type !== "text") return;
  //normal message parsing
  parseMessage(msg);
  //auto react to messages
  for (let channel of autoReactChannels) {
    autoReact(msg, channel.id, channel.emojis, channel.filter);
  }
});

bot.on("messageUpdate", (oldMsg, newMsg) => {
  if (
    newMsg.author.bot ||
    !newMsg.content.startsWith(prefix) ||
    oldMsg.content === newMsg.content
  ) {
    return;
  }

  newMsg.fetch().then((_msg: Message) => {
    bot.emit("message", _msg);
  });
});

bot.on("guildCreate", (guild) => {
  // makeTemplate(guild.id);
  setupReactionEmojis(guild);
  console.log(`Joining ${guild.name} (${guild.id})`);
});

bot.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
  if (oldVoiceState.member.id !== bot.user.id) {
    return;
  }
  if (!oldVoiceState.channel) {
    //bot just joined the voice chat
    return;
  }
  const guildQueue = getQueue(oldVoiceState.guild.id, oldVoiceState.client);
  if (!newVoiceState.channel) {
    //new voice state might not have a channel if bot was disconnected by someone
    return;
  }
  const oldChannelId = oldVoiceState.channel.id;
  const newChannelId = newVoiceState.channel.id;

  if (oldChannelId !== newChannelId) {
    guildQueue.voiceChannel = newVoiceState.channel;
    outputEmbed(
      guildQueue.textChannel,
      `Snacky was moved to **${newVoiceState.channel.name}**. Updating voice-channel informations...`,
      {
        color: colors.info,
        title: "",
      }
    );
  }
});

// bot.on("guildDelete", (guild) => {
//   set(guild.id, undefined);
//   console.log(`Got kicked from: ${guild.name} (${guild.id})`);
// });

//ugh fix that
// bot.on("voiceStateUpdate", (oldState, newState) => {
//   const voiceChannel = oldState;
//   let d = get(voiceChannel.guild.id); //TODO: change names to better ones :/
//   if (timeouts[oldState.guild.id]) clearTimeout(timeouts[oldState.guild.id]);

//   if (oldState.channelID === d.channelId && newState.channelID !== d.channelId) {
//     if (oldState.member.id === bot.user.id) {
//       if (newState.channelID === null) {
//         console.log(`Got disconnected from voice channel in server: ${oldState.guild.name}`);
//         d?.dispatcher?.end();
//         makeTemplate(oldState.guild.id);
//       } else {
//         console.log(`Got moved to another channel in server: ${oldState.guild.name}`);
//         d.channelId = newState.channel.id;
//         set(oldState.guild.id, d);
//       }
//     } else
//       timeouts[oldState.guild.id] = setTimeout(() => {
//         const voiceChannelMembers = oldState.guild.channels.resolve(oldState.channel.id).members;
//         if (voiceChannelMembers.size < 2) {
//           oldState.channel.leave();
//           makeTemplate(oldState.guild.id);

//           timeouts[oldState.guild.id] = undefined;
//           console.log(
//             `Leaving channel, because 0 users is in channel on server ${oldState.guild.name}`
//           );
//         }
//       }, 5000);
//   }
// });

if (!token) {
  console.error(
    `${consoleColors.red.bold(
      "[ Error ] No token was provided"
    )}\nMake sure you've created .env file with your token assigned to TOKEN variable\nAlso don't forget to import 'dotenv/config' at the top of your main file`
  );
  process.exit(1);
}

bot.login(token);
