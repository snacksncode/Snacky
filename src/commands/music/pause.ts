import { Message } from "discord.js";
import { getQueue } from "../../utils/music/queueManager";

function pauseCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  if (msg.member.voice.channel.id !== guildQueue.voiceChannel.id) {
    return msg.channel.send("You're not in the same voice chat as Snacky.");
  }
  if (!guildQueue) {
    return msg.channel.send("Bot is not currently in voicechat");
  }
  if (guildQueue.isPlaying) {
    guildQueue.isPlaying = false;
    guildQueue.connection.dispatcher.pause(true);
  }
}

export default pauseCommand;
