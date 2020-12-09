import { Message } from "discord.js";
import { colors } from "../../config";
import { getQueue } from "../../utils/music/queueManager";
import outputEmbed from "../../utils/outputEmbed";

function skipCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  try {
    if (!msg.member.voice.channel) {
      throw "You have to be in a voice channel to skip songs!";
    }
    if (!guildQueue) {
      throw "There is no song that I could skip!";
    }
  } catch (errMsg) {
    return outputEmbed(msg.channel, errMsg, {
      title: "",
      color: colors.error,
    });
  }
  guildQueue.isPlaying = true;
  guildQueue.connection.dispatcher.end();
  return outputEmbed(msg.channel, `Skipped song.`, {
    title: "",
    color: colors.success,
  });
}

export default skipCommand;
