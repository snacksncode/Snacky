import { Message } from "discord.js";
import { getQueue } from "../../utils/music/queueManager";

function skipCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  if (!msg.member.voice.channel)
    return msg.channel.send("You have to be in a voice channel to skip songs!");
  if (!guildQueue) return msg.channel.send("There is no song that I could skip!");
  guildQueue.connection.dispatcher.end();
}

export default skipCommand;
