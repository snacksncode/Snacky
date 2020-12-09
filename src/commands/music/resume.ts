import { Message } from "discord.js";
import { colors } from "../../config";
import { getQueue } from "../../utils/music/queueManager";
import outputEmbed from "../../utils/outputEmbed";

function resumeCommand(msg: Message) {
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
    if (!guildQueue.connection.dispatcher.paused) {
      throw "Playback is not currently paused";
    }
    if (!guildQueue.songs[0]) {
      throw "There's no songs in queue";
    }
  } catch (errMsg) {
    return outputEmbed(msg.channel, errMsg, {
      color: colors.warn,
      title: "",
    });
  }
  if (!guildQueue.isPlaying) {
    guildQueue.isPlaying = true;
    guildQueue.connection.dispatcher.resume();
    outputEmbed(msg.channel, "Resumed current player", {
      color: colors.success,
      title: "",
    });
  }
}

export default resumeCommand;
