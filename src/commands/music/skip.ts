import { Message } from "discord.js";
import { colors } from "../../config";
import { getQueue } from "../../utils/music/queueManager";
import outputEmbed from "../../utils/outputEmbed";

function skipCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  if (!msg.member.voice.channel) {
    return msg.channel.send("You have to be in a voice channel to skip songs!");
  }
  if (!guildQueue) {
    return msg.channel.send("There is no song that I could skip!");
  }
  guildQueue.isPlaying = true;
  guildQueue.connection.dispatcher.end();
  return outputEmbed(msg.channel, `Skipped song.`, {
    title: "",
    color: colors.success,
  });
}

export default skipCommand;
