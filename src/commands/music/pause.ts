import { Message } from "discord.js";
import { colors } from "../../config";
import { getQueue } from "../../utils/music/queueManager";
import outputEmbed from "../../utils/outputEmbed";

function pauseCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  try {
    if (!guildQueue) {
      throw "Bot is not currently in voicechat";
    }
    if (!msg.member.voice) {
      throw "You're not currently in voice channel";
    }
    if (msg.member.voice.channel.id !== guildQueue.voiceChannel.id) {
      throw "You're not in the same voice chat as Snacky.";
    }
    if (!guildQueue.isPlaying) {
      throw "Bot is not currently playing anything";
    }
  } catch (errMsg) {
    return outputEmbed(msg.channel, "", {
      color: colors.warn,
      title: errMsg,
      author: msg.author,
    });
  }
  if (guildQueue.isPlaying) {
    guildQueue.isPlaying = false;
    guildQueue.connection.dispatcher.pause(true);
  }
}

export default pauseCommand;
