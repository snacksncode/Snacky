import { Message } from "discord.js";
import { colors } from "../../config";
import { getQueue } from "../../utils/music/queueManager";
import outputEmbed from "../../utils/outputEmbed";

function stopCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  try {
    if (!msg.member.voice.channel) {
      throw "You have to be in a voice channel to stop the music.";
    }
    if (!guildQueue) {
      throw "Bot is not currently playing music";
    }
  } catch (errMsg) {
    return outputEmbed(msg.channel, errMsg, {
      title: "",
      color: colors.error,
    });
  }
  guildQueue.voiceChannel.leave();
  msg.client.guildsQueue.delete(msg.guild.id);
  outputEmbed(msg.channel, "Bot has stopped playback, left voice chat and deleted server queue", {
    color: colors.success,
    title: "",
  });
}

export default stopCommand;
